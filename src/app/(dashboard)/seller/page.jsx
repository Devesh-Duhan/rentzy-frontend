"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Building2, Eye, Mail, Star, Bolt, Plus, Bell, CheckCircle2, MessageSquare, CalendarCheck, TrendingUp } from "lucide-react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import ContentSkeleton from "@/components/ContentSkeleton";

export default function SellerOverview() {
  const { user } = useSelector(state => state.auth);
  const { data: sellerStats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['seller-stats', user?._id],
    enabled: !!user?._id,
    queryFn: async () => {
      const response = await axios.get('/properties/seller-stats');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: visitsData, isLoading: visitsLoading, isError: visitsError, refetch: refetchVisits } = useQuery({
    queryKey: ['seller-visits-count', user?._id],
    enabled: !!user?._id,
    queryFn: async () => {
      // Scoped server-side to visits on this seller's properties.
      const response = await axios.get('/visits');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: reviewsData, isLoading: reviewsLoading, isError: reviewsError, refetch: refetchReviews } = useQuery({
    queryKey: ['seller-reviews', user?._id],
    enabled: !!user?._id,
    queryFn: async () => {
      // /api/reviews is admin-only. /api/reviews/seller returns only reviews on
      // this seller's own properties.
      const response = await axios.get('/reviews/seller');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const visits = visitsData?.data || visitsData?.visits || (Array.isArray(visitsData) ? visitsData : []);
  const reviews = reviewsData?.reviews || (Array.isArray(reviewsData) ? reviewsData : []);

  const statsState = { loading: statsLoading, failed: statsError };
  const stats = [
    { ...statsState, label: "Total Properties", value: sellerStats?.totalProperties || "0", icon: Building2, color: "blue" },
    { ...statsState, label: "Total Views", value: sellerStats?.totalViews?.toLocaleString() || "0", icon: Eye, color: "emerald" },
    { ...statsState, label: "Total Inquiries", value: sellerStats?.totalInquiries || "0", icon: Mail, color: "amber" },
    { ...statsState, label: "Avg Rating", value: `${sellerStats?.avgRating || "0"}⭐`, icon: Star, color: "rose" },
    { loading: reviewsLoading, failed: reviewsError, label: "Recent Reviews", value: reviews.length.toString(), icon: Star, color: "yellow" },
    { ...statsState, label: "Performance", value: `${sellerStats?.totalViews > 0 ? "+" : ""}${Math.round((sellerStats?.totalViews || 0) * 0.15)}%`, icon: Eye, color: "emerald" },
  ];

  const notifications = [
    ...(sellerStats?.totalInquiries
      ? [{ icon: MessageSquare, color: "text-blue-500", text: `${sellerStats.totalInquiries} total inquiries received` }]
      : []),
    ...(visits.filter(v => v.status === "pending").slice(0, 2).map(v => ({ icon: CalendarCheck, color: "text-amber-500", text: `Pending site visit: ${v.visitorName || "Unknown"}` }))),
    { icon: CheckCircle2, color: "text-emerald-500", text: `Property performance up ${Math.round((sellerStats?.totalViews || 0) * 0.15)}% this month` },
  ];

  return (
    <div className="flex flex-col space-y-6 animate-fade-in">
      {(statsError || visitsError || reviewsError) && (
        <div role="alert" className="app-card p-4 text-sm text-red-600">
          Some dashboard data could not be loaded.
          <button type="button" onClick={() => { if (statsError) refetchStats(); if (visitsError) refetchVisits(); if (reviewsError) refetchReviews(); }} className="ml-3 underline">Try again</button>
        </div>
      )}
      <div className="app-card p-6">
        <h3 className="section-title text-lg mb-4 flex items-center gap-2">
          <Bolt className="text-amber-500" size={20} /> Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/add" className="btn-primary flex items-center justify-center gap-2 text-sm py-4">
            <Plus size={18} /> Add New Property
          </Link>
          <Link href="/seller/profile" className="btn-secondary flex items-center justify-center gap-2 text-sm py-4">
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="app-card p-5 hover:shadow-md transition group">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <stat.icon size={20} />
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {stat.loading ? <span role="status" aria-label={"Loading " + stat.label} className="inline-block h-6 w-20 animate-pulse rounded bg-slate-200 motion-reduce:animate-none dark:bg-slate-700" /> : stat.failed ? "—" : stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="app-card p-6">
          <h3 className="section-title text-lg mb-6 flex items-center gap-2">
            <Bell className="text-indigo-500" size={20} /> Recent Activities
          </h3>
          {statsLoading || visitsLoading ? <ContentSkeleton label="Loading recent activities" /> : statsError || visitsError ? <p className="text-sm text-slate-500">Activities could not be loaded.</p> : <div className="space-y-4">
            {notifications.map((note, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-1 ${note.color}`}>
                  <note.icon size={18} />
                </div>
                <div className="flex-1 pb-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0 last:pb-0">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{note.text}</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">Recently</p>
                </div>
              </div>
            ))}
          </div>}
        </div>

        <div className="app-card p-6">
          <h3 className="section-title text-lg mb-8 flex items-center gap-2">
            <TrendingUp className="text-indigo-500" size={20} /> Insights & Performance
          </h3>
          {statsLoading ? <ContentSkeleton label="Loading performance" count={1} itemClassName="h-56" /> : statsError ? <p className="text-sm text-slate-500">Performance could not be loaded.</p> : <div className="h-56 w-full flex items-end justify-between gap-3 px-4 pb-12 relative border-b border-l border-slate-100 dark:border-slate-700">
            {(sellerStats?.performanceData || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]).map((h, i) => (
              <div key={i} className="flex-1 bg-indigo-100 dark:bg-indigo-500/10 rounded-t-lg relative group transition-all duration-500 hover:bg-indigo-200 dark:hover:bg-indigo-500/20">
                <motion.div 
                  initial={{ height: 0 }} 
                  animate={{ height: `${h}%` }} 
                  className="absolute bottom-0 left-0 right-0 bg-indigo-600 rounded-t-lg" 
                />
              </div>
            ))}
            <div className="absolute -bottom-8 left-0 right-0 flex justify-between text-xs text-slate-400 font-semibold">
              <span>JAN</span>
              <span>JUN</span>
              <span>DEC</span>
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}
