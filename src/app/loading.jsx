"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md z-[500] flex flex-col items-center justify-center">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-slate-100 dark:border-slate-700 border-t-indigo-600 rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-8 bg-indigo-600/10 rounded-full"
          />
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">rentzypro</h2>
        <p className="text-xs text-slate-400 dark:text-slate-300 font-black uppercase tracking-widest mt-1">Loading experience...</p>
      </motion.div>
    </div>
  );
}
