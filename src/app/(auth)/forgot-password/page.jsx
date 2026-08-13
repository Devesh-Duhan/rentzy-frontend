"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendForgotPasswordOtp, reset } from "@/store/slices/authSlice";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, Lock } from "lucide-react";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ text: "", type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus({ text: "Please enter a valid email address.", type: "error" });
      return;
    }
    setStatus({ text: "", type: "" });
    try {
      await dispatch(sendForgotPasswordOtp(email)).unwrap();
      setStatus({ text: "Password reset OTP sent to your email!", type: "success" });
      setTimeout(() => {
        router.push(`/verify-otp?type=reset&email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (error) {
      setStatus({
        text: typeof error === "string" ? error : error?.message || "Failed to send OTP. Please try again.",
        type: "error",
      });
    } finally {
      dispatch(reset());
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/10 rounded-full" />
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/15 backdrop-blur rounded-3xl mb-8 border border-white/20">
            <Lock className="text-white" size={36} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Reset password</h1>
          <p className="text-lg text-indigo-200 max-w-sm mx-auto leading-relaxed">
            Enter your email and we&apos;ll send you a one-time password to reset your account.
          </p>
          <div className="mt-12 flex justify-center gap-3">
            <div className="w-2 h-2 rounded-full bg-white/40" />
            <div className="w-6 h-2 rounded-full bg-white" />
            <div className="w-2 h-2 rounded-full bg-white/40" />
          </div>
        </motion.div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0a0a1a]">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Lock className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">rentzypro</span>
          </div>

          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8">
            <ArrowLeft size={16} />
            Back to login
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Forgot password?</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Enter your registered email to receive a recovery OTP.</p>
          </div>

          <AnimatePresence mode="wait">
            {status.text && (
              <motion.div
                key={status.text}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={`flex items-start gap-3 p-4 rounded-xl text-sm mb-6 ${
                  status.type === "error"
                    ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/20"
                    : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20"
                }`}
              >
                {status.type === "error" ? <AlertCircle size={18} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={18} className="shrink-0 mt-0.5" />}
                <span>{status.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity -z-10 blur-[1px]" />
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setStatus({ text: "", type: "" }); }}
                    placeholder="your@email.com"
                    required
                    autoComplete="email"
                    className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-0 outline-none transition-all dark:focus:border-indigo-400"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                "Send Reset Code"
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
