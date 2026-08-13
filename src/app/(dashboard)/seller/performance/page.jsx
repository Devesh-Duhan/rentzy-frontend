"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, MousePointer2, Share2, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getSellerStats } from "@/store/slices/propertySlice";

export default function SellerPerformance() {
  const dispatch = useDispatch();
  const { sellerStats, isLoading } = useSelector((state) => state.property);

  useEffect(() => {
    dispatch(getSellerStats());
  }, [dispatch]);

  const metrics = [
    { label: "Total Views", value: sellerStats?.totalViews?.toLocaleString() || "0", icon: TrendingUp },
    { label: "Total Inquiries", value: sellerStats?.totalInquiries || "0", icon: Users },
    { label: "Avg Rating", value: `${sellerStats?.avgRating || "0"}⭐`, icon: MousePointer2 },
    { label: "Properties", value: sellerStats?.totalProperties || "0", icon: Share2 },
  ];

  if (isLoading && !sellerStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Performance Summary</h2>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs py-2 px-4">DAILY</button>
          <button className="bg-indigo-600 text-white rounded-xl text-xs font-bold px-4 py-2 shadow-lg shadow-indigo-500/20">WEEKLY</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <div key={i} className="app-card p-5">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
              <metric.icon size={20} />
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{metric.label}</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{metric.value}</h3>
          </div>
        ))}
      </div>

      <div className="app-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-900 dark:text-white">Projected View Growth</h3>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold">
            <TrendingUp size={14} /> +15.5% vs last week
          </div>
        </div>
        <div className="h-64 w-full flex items-end justify-between gap-3 px-4 pb-12 relative border-b border-l border-slate-100 dark:border-slate-700">
          {(sellerStats?.performanceData || [30, 45, 35, 70, 50, 65, 80, 55, 90, 75, 40, 60]).map((h, i) => (
            <div key={i} className="flex-1 bg-indigo-100 dark:bg-white/5 rounded-t-lg relative group transition-all duration-300 hover:bg-slate-50 dark:hover:bg-white/10">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                className={`absolute bottom-0 left-0 right-0 rounded-t-lg ${i === (sellerStats?.performanceData?.length - 1 || 11) ? 'bg-indigo-600 shadow-xl' : 'bg-slate-300 dark:bg-slate-700'}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
