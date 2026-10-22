"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { login, reset } from "@/store/slices/authSlice";
import { Mail, Lock, Eye, EyeOff, LogIn, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
import GoogleLoginButton from "@/components/GoogleLoginButton";

const LoginPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isLoading, isError, message } = useSelector((s) => s.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState({ text: "", type: "" });

  const redirectUser = useCallback((u) => {
    // Honour the destination captured by src/middleware.js, but only for
    // same-origin absolute paths (never "//evil.com" or "https://...").
    const next = new URLSearchParams(window.location.search).get("next");
    const isSafeNext =
      typeof next === "string" && next.startsWith("/") && !next.startsWith("//");

    if (isSafeNext) {
      router.push(next);
      return;
    }

    if (u.role === "admin") router.push("/admin");
    else if (u.role === "seller") router.push("/seller");
    else router.push("/");
  }, [router]);

  useEffect(() => {
    if (user) {
      setStatus({ text: `Welcome back, ${user.name}!`, type: "success" });
      const t = setTimeout(() => redirectUser(user), 600);
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

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim()) { setStatus({ text: "Enter your email address", type: "error" }); return; }
    if (!password) { setStatus({ text: "Enter your password", type: "error" }); return; }
    setStatus({ text: "", type: "" });
    dispatch(login({ email: email.trim(), password }));
  };

  return (
    <div className="auth-market min-h-screen flex">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/10 rounded-full" />
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative z-50 text-center pointer-events-auto">
          <Link href="/" aria-label="Go to homepage" title="Go to homepage" className="inline-flex items-center justify-center w-20 h-20 bg-white/15 backdrop-blur rounded-3xl mb-8 border border-white/20 hover:bg-white/25 transition-all cursor-pointer shadow-xl relative z-50">
            <BrandLogo size={80} className="h-full w-full rounded-3xl" />
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">rentzypro</h1>
          <p className="text-lg text-indigo-200 max-w-sm mx-auto leading-relaxed">
            India&apos;s trusted platform for finding rental properties directly from owners.
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
          <div className="lg:hidden flex flex-wrap items-center gap-3 mb-8">
            <Link href="/" aria-label="Go to homepage" title="Go to homepage" className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">
              <BrandLogo size={40} className="h-full w-full rounded-xl" />
            </Link>
            <span className="text-xl font-bold text-slate-900 dark:text-white">rentzypro</span>
            <Link href="/" className="ml-auto text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">Back to home</Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to continue to your account.</p>
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

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity -z-10 blur-[1px]" />
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setStatus({ text: "", type: "" }); }}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-0 outline-none transition-all dark:focus:border-indigo-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <Link href="/forgot-password" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity -z-10 blur-[1px]" />
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setStatus({ text: "", type: "" }); }}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-11 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-0 outline-none transition-all dark:focus:border-indigo-400"
                  />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
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
                <><LogIn size={18} /><span>Sign In</span></>
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

            <GoogleLoginButton text="signin_with" />

            <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                Create one
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
