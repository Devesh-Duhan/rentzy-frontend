"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <h1 className="text-[180px] font-black text-slate-100 dark:text-slate-800 leading-none select-none tracking-tighter">404</h1>
        <div className="mt-[-60px]">
          <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-tight">Page Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto mb-10">
            The property or page you're looking for has moved to a new neighborhood or doesn't exist anymore.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-2xl shadow-indigo-200 dark:bg-indigo-700 dark:text-white dark:shadow-none hover:bg-indigo-700 transition-all group"
            >
              <Home size={18} className="group-hover:-translate-y-0.5 transition-transform" /> Back to Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-8 py-4 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Go Back
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
