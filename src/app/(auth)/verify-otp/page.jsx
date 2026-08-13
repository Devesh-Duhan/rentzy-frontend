"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Mail, ArrowLeft, CheckCircle2, AlertCircle, Timer } from "lucide-react";
import { verifyRegisterOtp, resendRegisterOtp } from "@/store/slices/authSlice";

const VerifyOtpContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";
  const type = searchParams.get("type") || "verification";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResend = async () => {
    setTimer(30);
    setCanResend(false);
    try {
      if (type === "register") {
        await dispatch(resendRegisterOtp(email)).unwrap();
        setMessage({ text: "A new verification code has been sent to your email.", type: "success" });
      } else {
        setMessage({ text: "A new OTP has been sent to your email.", type: "success" });
      }
    } catch (error) {
      setMessage({ text: error || "Unable to resend code.", type: "error" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) return;
    setIsLoading(true);
    try {
      if (type === "register") {
        const user = await dispatch(verifyRegisterOtp({ email, otp: otpValue })).unwrap();
        setMessage({ text: "Verification Successful! Account created.", type: "success" });
        setTimeout(() => {
          if (user.role === 'admin') router.push("/admin");
          else if (user.role === 'seller') router.push("/seller");
          else router.push("/");
        }, 1500);
      } else if (type === "reset") {
        setMessage({ text: "OTP Verified! Please set a new password.", type: "success" });
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${otpValue}`);
        }, 1200);
      } else {
        setMessage({ text: "Verification Successful!", type: "success" });
        setTimeout(() => {
          router.push("/");
        }, 1500);
      }
    } catch (error) {
      const errMessage = error?.toString().includes("Network Error")
        ? "Network Error: Cannot connect to the server. Please check your internet connection or ensure the backend is running."
        : error || "Invalid or expired code.";
      setMessage({ text: errMessage, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-effect p-8 md:p-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl mb-5"
          >
            <ShieldCheck size={32} />
          </motion.div>
          <h1 className="section-title">Verify OTP</h1>
          <p className="section-subtitle">
            We&apos;ve sent a 6-digit code to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>
          </p>
          {mounted && (
            <p className="text-xs text-slate-400 mt-3 font-medium">
              Session: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        <AnimatePresence mode="wait">
          {message.text && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
              exit={{ opacity: 0, height: 0 }}
              className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium overflow-hidden ${message.type === "error" ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400" : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}
            >
              {message.type === "error" ? <AlertCircle size={18} className="shrink-0" /> : <CheckCircle2 size={18} className="shrink-0" />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                ref={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-full aspect-square text-center text-xl font-bold bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-900 dark:text-white"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.join("").length < 6}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify & Proceed"}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Timer size={16} />
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Resend Code
              </button>
            ) : (
              <span>Resend in {timer}s</span>
            )}
          </div>

          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft size={14} /> Try another email
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const VerifyOtpPage = () => (
  <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
    </div>
  }>
    <VerifyOtpContent />
  </Suspense>
);

export default VerifyOtpPage;
