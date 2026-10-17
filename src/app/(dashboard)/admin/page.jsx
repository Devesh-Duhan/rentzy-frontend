"use client";
import ContentSkeleton from "@/components/ContentSkeleton";


import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Building2, TrendingUp, AlertCircle, Database } from "lucide-react";
import axios from "@/lib/axios";

export default function AdminOverview() {
  const [stats, setStats] = useState([
    { label: "Total Users", value: "0", icon: Users, color: "indigo" },
    { label: "Total Listings", value: "0", icon: Building2, color: "emerald" },
    { label: "Bookings", value: "0", icon: Database, color: "amber" },
    { label: "Revenue", value: "0", icon: TrendingUp, color: "rose" },
  ]);

  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get('/admin/stats');
      
      setStats([
        { label: "Total Users", value: data.totalUsers.toString(), icon: Users, color: "indigo" },
        { label: "Total Listings", value: data.totalProperties.toString(), icon: Building2, color: "emerald" },
        { label: "Bookings", value: data.totalBookings.toString(), icon: Database, color: "amber" },
        { label: "Revenue", value: `₹${data.totalRevenue?.toLocaleString() || '0'}`, icon: TrendingUp, color: "rose" },
      ]);
    } catch (error) {
      console.error("Dashboard fetch failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-slate-800/40 p-6 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 dark:bg-${stat.color}-500/10 dark:text-${stat.color}-400 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
              {isLoading ? <ContentSkeleton label={`Loading ${stat.label}`} count={1} itemClassName="h-8 w-24" /> : <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800/40 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm p-8">
         <h3 className="text-xl font-black mb-4 flex items-center gap-3">
            <AlertCircle className="text-indigo-600" /> Administrative Insight
         </h3>
         <p className="text-slate-500 font-medium">
            Welcome to the live administration desk. The dashboard is now connected to the production database. 
            Use the sidebar to manage users, verify listings, and handle platform health.
         </p>
      </div>
    </div>
  );
}
