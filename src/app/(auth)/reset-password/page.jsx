"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { resetPassword } from "@/store/slices/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const [form, setForm] = useState({ password: "", confirm: "" });
    const [status, setStatus] = useState({ text: "", type: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const dispatch = useDispatch();

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otp = sessionStorage.getItem('passwordResetOtp') || searchParams.get('otp') || '';
        if (!form.password || !form.confirm) {
            setStatus({ text: "All fields are required.", type: "error" });
            return;
        }
        if (form.password.length < 6) {
            setStatus({ text: "Password must be at least 6 characters.", type: "error" });
            return;
        }
        if (form.password !== form.confirm) {
            setStatus({ text: "Passwords do not match.", type: "error" });
            return;
        }
        if (!otp) {
            setStatus({ text: "Session expired. Please request a new OTP.", type: "error" });
            return;
        }
        setIsLoading(true);
        try {
            await dispatch(resetPassword({ email, password: form.password, otp })).unwrap();
            sessionStorage.removeItem('passwordResetOtp');
            setStatus({ text: "Password reset successful! Redirecting to login...", type: "success" });
            setTimeout(() => router.push("/login"), 1800);
        } catch (error) {
            setStatus({ text: error || "Failed to reset password.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md glass-effect p-8 md:p-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-5">
                        <Lock size={28} />
                    </div>
                    <h1 className="section-title">Reset Password</h1>
                    <p className="section-subtitle">Set a new password for <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span></p>
                </div>

                <AnimatePresence mode="wait">
                    {status.text && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium overflow-hidden ${status.type === "error" ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400" : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                }`}
                        >
                            {status.type === "error" ? <AlertCircle size={18} className="shrink-0" /> : <CheckCircle2 size={18} className="shrink-0" />}
                            {status.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Min. 6 characters"
                                className="input-field pl-10 pr-10"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type={showConfirm ? "text" : "password"}
                                name="confirm"
                                value={form.confirm}
                                onChange={handleChange}
                                placeholder="Re-enter password"
                                className="input-field pl-10 pr-10"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                            >
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            "Reset Password"
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
