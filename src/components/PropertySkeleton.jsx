"use client";

import { motion } from "framer-motion";

const PropertySkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden group">
      <div className="relative h-48 bg-slate-200 dark:bg-slate-800 animate-pulse">
        {/* Shiny sweep effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      </div>
      <div className="p-6 space-y-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4 animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/2 animate-pulse" />
        </div>
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3 animate-pulse" />
        <div className="flex gap-3 pt-2">
          <div className="h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex-1 animate-pulse" />
          <div className="h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex-1 animate-pulse" />
          <div className="h-10 bg-slate-100 dark:bg-slate-900 rounded-xl w-10 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default PropertySkeleton;
