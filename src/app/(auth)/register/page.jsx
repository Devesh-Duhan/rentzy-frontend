"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { register, reset, sendRegisterOtp, verifyRegisterOtp } from "@/store/slices/authSlice";
import { User, Mail, Lock, Eye, EyeOff, Store, AlertCircle, CheckCircle2, Home } from "lucide-react";
import GoogleLoginButton from "@/components/GoogleLoginButton";

const RegisterPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isLoading, isError, message } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ name: "", email: "", password: "", terms: false });
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState({ text: "", type: "" });
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");

  const redirectUser = useCallback((u) => {
    if (u.role === "admin") router.push("/admin");
    else if (u.role === "seller") router.push("/seller");
    else router.push("/");
  }, [router]);

  useEffect(() => {
    if (user) {
      setStatus({ text: "Account created successfully!", type: "success" });
      const t = setTimeout(() => redirectUser(user), 800);
      return () => clearTimeout(t);
    }
  }, [user, redirectUser]);

  useEffect(() => {
    if (isError && message) {
      setStatus({ text: message, type: "error" });
      const t = setTimeout(() => { dispatch(reset()); setStatus({ text: "", type: "" }); }, 5000);
      return () => clearTimeout(t);
    }
  }, [isError, message, dispatch]);

  const clearStatus = () => setStatus({ text: "", type: "" });

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [id]: type === "checkbox" ? checked : value }));
    clearStatus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otpStep) {
      if (!otp.trim()) {
        setStatus({ text: "Please enter the OTP.", type: "error" });
        return;
      }
      clearStatus();
      dispatch(verifyRegisterOtp({ email: form.email.trim(), otp: otp.trim() }));
      return;
    }

    const { name, email, password, terms } = form;
    if (!name.trim()) { setStatus({ text: "Please enter your full name.", type: "error" }); return; }
    if (!email.trim()) { setStatus({ text: "Please enter your email address.", type: "error" }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setStatus({ text: "Please enter a valid email address.", type: "error" }); return; }
    if (password.length < 6) { setStatus({ text: "Password must be at least 6 characters.", type: "error" }); return; }
    if (!terms) { setStatus({ text: "Please accept the Terms of Service to continue.", type: "error" }); return; }
    clearStatus();
    const isSellerFlow = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('role') === 'seller' : false;
    const role = isSellerFlow ? "seller" : "buyer";
    
    const resultAction = await dispatch(sendRegisterOtp({ name: name.trim(), email: email.trim(), password, role }));
    if (sendRegisterOtp.fulfilled.match(resultAction)) {
      setOtpStep(true);
      setStatus({ text: "OTP sent to your email. Please enter it below.", type: "success" });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/10 rounded-full" />
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative z-50 text-center pointer-events-auto">
          <a href="/" className="inline-flex items-center justify-center w-20 h-20 bg-white/15 backdrop-blur rounded-3xl mb-8 border border-white/20 hover:bg-white/25 transition-all cursor-pointer shadow-xl relative z-50">
            <Store className="text-white" size={36} />
          </a>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Join rentzypro</h1>
          <p className="text-lg text-indigo-200 max-w-sm mx-auto leading-relaxed">
            Create your account and start listing properties on India&apos;s most trusted rental platform.
          </p>
          <div className="mt-12 flex justify-center gap-3">
            <div className="w-2 h-2 rounded-full bg-white/40" />
            <div className="w-2 h-2 rounded-full bg-white/40" />
            <div className="w-6 h-2 rounded-full bg-white" />
          </div>
        </motion.div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0a0a1a]">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Link href="/" className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">
              <Home className="text-white" size={20} />
            </Link>
            <span className="text-xl font-bold text-slate-900 dark:text-white">rentzypro</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Create account</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Join as a seller and list your properties.</p>
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
            {!otpStep ? (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity -z-10 blur-[1px]" />
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input id="name" type="text" value={form.name} onChange={handleChange} required autoComplete="name" placeholder="John Doe" className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-0 outline-none transition-all dark:focus:border-indigo-400" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity -z-10 blur-[1px]" />
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input id="email" type="email" value={form.email} onChange={handleChange} required autoComplete="email" placeholder="name@company.com" className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-0 outline-none transition-all dark:focus:border-indigo-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity -z-10 blur-[1px]" />
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                      <input id="password" type={show ? "text" : "password"} value={form.password} onChange={handleChange} required minLength={6} autoComplete="new-password" placeholder="Min. 6 characters" className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-11 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-0 outline-none transition-all dark:focus:border-indigo-400" />
                      <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {show ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-1">
                  <input id="terms" type="checkbox" checked={form.terms} onChange={handleChange} className="mt-1 w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-600 rounded focus:ring-indigo-500 cursor-pointer shrink-0 accent-indigo-600" required />
                  <label htmlFor="terms" className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Terms of Service</Link> and{" "}
                    <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Privacy Policy</Link>.
                  </label>
                </div>

                <button type="submit" disabled={isLoading} className="relative w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><span>Send OTP</span></>
                  )}
                </button>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 text-xs text-slate-400 bg-slate-50 dark:bg-[#0a0a1a]">or continue with</span>
                  </div>
                </div>

                <GoogleLoginButton text="signup_with" />

                <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
                  Already a member?{" "}
                  <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">Sign In</Link>
                </p>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Enter OTP</label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity -z-10 blur-[1px]" />
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                      <input id="otp" type="text" value={otp} onChange={(e) => { setOtp(e.target.value); clearStatus(); }} required placeholder="6-digit OTP" className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-0 outline-none transition-all dark:focus:border-indigo-400" />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="relative w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><span>Verify & Create Account</span></>
                  )}
                </button>
                
                <div className="text-center mt-4">
                  <button type="button" onClick={() => setOtpStep(false)} className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Back to Registration
                  </button>
                </div>
              </>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
