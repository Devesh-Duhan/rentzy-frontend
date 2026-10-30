"use client";

import React from "react";

const PropertyDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 animate-pulse">
       <main className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] gap-8 md:gap-12 lg:gap-16 xl:gap-20">
             
             {/* Gallery Skeleton */}
             <div className="space-y-8 md:space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[400px] md:h-[550px] w-full">
                   <div className="md:col-span-8 bg-slate-200 dark:bg-slate-800 rounded-[32px]" />
                   <div className="hidden md:grid md:col-span-4 grid-rows-2 gap-4">
                      <div className="bg-slate-200 dark:bg-slate-800 rounded-[24px]" />
                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-slate-200 dark:bg-slate-800 rounded-[20px]" />
                         <div className="bg-slate-200 dark:bg-slate-800 rounded-[20px]" />
                      </div>
                   </div>
                </div>
                
                <div className="bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[48px] md:rounded-[56px] p-6 sm:p-10 md:p-16 border border-slate-100 dark:border-white/5 space-y-12">
                   <div className="flex flex-col lg:flex-row justify-between gap-8">
                      <div className="space-y-6 flex-1">
                         <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded-full" />
                         <div className="h-16 w-full bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                         <div className="h-8 w-64 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                      </div>
                      <div className="h-48 w-full md:w-80 bg-slate-900 rounded-[32px]" />
                   </div>
                   
                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      {[1, 2, 3, 4].map(i => (
                         <div key={i} className="h-32 bg-slate-50 dark:bg-slate-800 rounded-[32px]" />
                      ))}
                   </div>
                   
                   <div className="space-y-4">
                      <div className="h-8 w-48 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                      <div className="h-32 w-full bg-slate-50 dark:bg-slate-800 rounded-2xl" />
                   </div>
                </div>
             </div>

             {/* Sidebar Skeleton */}
             <aside className="space-y-8 md:space-y-12">
                <div className="h-[600px] w-full bg-slate-900 rounded-[40px] md:rounded-[64px]" />
                <div className="h-80 w-full bg-indigo-600 rounded-[56px]" />
             </aside>
          </div>
       </main>
    </div>
  );
};

export default PropertyDetailSkeleton;
