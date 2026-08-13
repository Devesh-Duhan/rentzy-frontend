"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCcw, Home, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-rose-50/20 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10"
      >
        <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-rose-500/10">
          <AlertCircle size={48} />
        </div>

        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-tight">Something Went Wrong</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto mb-10 leading-relaxed">
          We encountered an unexpected error while trying to process your request. Our team has been notified.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl dark:bg-indigo-700 dark:text-white hover:bg-indigo-700 transition-all group"
          >
            <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" /> Try Again
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-8 py-4 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
          >
            <Home size={18} className="group-hover:-translate-y-0.5 transition-transform" /> Return Home
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-12 p-6 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-3xl text-left max-w-2xl mx-auto overflow-x-auto">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Error Details (Dev Mode Only)</p>
            <code className="text-xs text-rose-500 font-mono italic break-words">{error?.message || "Unknown error occurred."}</code>
          </div>
        )}
      </motion.div>
    </div>
  );
}
