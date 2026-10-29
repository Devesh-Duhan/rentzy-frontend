"use client";

import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import ContentSkeleton from "@/components/ContentSkeleton";
import {
  Users,
  Building2,
  RefreshCcw,
  Eye,
  BarChart3,
  PieChart,
  Home,
  CheckCircle2,
  Clock,
  Mail,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "@/lib/axios";

function monthlySeries(rows = [], generatedAt) {
  const now = generatedAt ? new Date(generatedAt) : new Date();
  const counts = new Map(rows.map(row => [row._id, row.count]));
  return Array.from({ length: 6 }, (_, index) => {
    const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + index, 1));
    const key = month.toISOString().slice(0, 7);
    return { month: month.toLocaleDateString('en-IN', { month: 'short', year: '2-digit', timeZone: 'UTC' }), count: counts.get(key) ?? 0 };
  });
}

function SimpleBarChart({ data, dataKey, color, height = 200 }) {
  const max = Math.max(...data.map((d) => d[dataKey]), 1);
  const labels = data.map((d) => d.label || d.month || d.name);

  return (
    <div className="flex items-end gap-2 h-full" style={{ minHeight: height }}>
      {data.map((d, i) => {
        const value = d[dataKey];
        const barHeight = (value / max) * (height - 30);
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1">{value}</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: barHeight }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
              className={`w-full max-w-[40px] ${color} rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer`}
              style={{ height: barHeight }}
            />
            <span className="text-[9px] font-bold text-slate-400 mt-2">{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

function HorizontalBar({ label, value, total, colorClass }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{label}</span>
        <span className="text-xs font-black text-slate-900 dark:text-white">{value} ({pct}%)</span>
      </div>
      <div className="w-full h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${colorClass}`}
        />
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { user } = useSelector(state => state.auth);
  const { data: analytics, isPending: isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['admin', 'analytics', user?._id],
    enabled: user?.role === 'admin',
    queryFn: async ({ signal }) => {
      const { data } = await axios.get('/admin/analytics', { signal });
      if (!data?.totals || !Array.isArray(data.usersOverTime) || !Array.isArray(data.propertiesOverTime)) throw new Error('Analytics data unavailable');
      return data;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
  const kpis = [
    { label: 'Total Users', value: analytics?.totals.users, icon: Users, colorClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' },
    { label: 'Total Properties', value: analytics?.totals.properties, icon: Building2, colorClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
    { label: 'Total Inquiries', value: analytics?.totals.leads, icon: Mail, colorClass: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' },
    { label: 'Pending Verification', value: analytics?.totals.pendingVerification, icon: ShieldCheck, colorClass: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' },
  ];
  const usersOverTime = monthlySeries(analytics?.usersOverTime, analytics?.generatedAt);
  const propertiesOverTime = monthlySeries(analytics?.propertiesOverTime, analytics?.generatedAt);
  const propertyStatus = Object.fromEntries((analytics?.propertyStatusStats || []).map(row => [row._id, row.count]));
  const totalProps = Object.values(propertyStatus).reduce((sum, count) => sum + count, 0);
  const topProperties = (analytics?.topProperties || []).filter(row => row.property).map(row => ({ ...row.property, views: row.totalViews }));

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Analytics</h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold mt-2">Users, listings, inquiries and verification overview.</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="px-6 py-3.5 bg-indigo-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl hover:bg-slate-900 transition-all"
        >
          <RefreshCcw size={16} className={isFetching ? "animate-spin" : ""} /> Refresh Data
        </button>
      </div>

      {isError && <div role="alert" className="app-card p-4 text-sm text-rose-600">
        {analytics ? 'Refresh failed. Showing previously loaded data.' : 'Analytics could not be loaded.'}
        <button type="button" onClick={() => refetch()} disabled={isFetching} className="ml-2 underline">Try again</button>
      </div>}
      {isLoading ? (
        <ContentSkeleton label="Loading analytics" count={4} className="grid grid-cols-2 gap-4 lg:grid-cols-4" itemClassName="h-36" />
      ) : !analytics ? null : (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {kpis.map((kpi, i) => {
              const displayValue = typeof kpi.value === "number" ? kpi.value.toLocaleString('en-IN') : '—';

              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-slate-800/40 p-6 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${kpi.colorClass} group-hover:scale-110 transition-transform`}>
                      <kpi.icon size={24} />
                    </div>

                  </div>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{kpi.label}</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{displayValue}</h3>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800/40 p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600">
                  <BarChart3 size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Users Over Time</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 6 months</p>
                </div>
              </div>
              <div className="h-[200px]">
                <SimpleBarChart
                  data={usersOverTime.map((d) => ({ ...d, count: d.count || 0 }))}
                  dataKey="count"
                  color="bg-indigo-500"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800/40 p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">
                  <Building2 size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Properties Over Time</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 6 months</p>
                </div>
              </div>
              <div className="h-[200px]">
                <SimpleBarChart
                  data={propertiesOverTime.map((d) => ({ ...d, count: d.count || 0 }))}
                  dataKey="count"
                  color="bg-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white dark:bg-slate-800/40 p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600">
                  <PieChart size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Property Status</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Distribution</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                <HorizontalBar label="Available" value={propertyStatus.available || 0} total={totalProps} colorClass="bg-emerald-500" />
                <HorizontalBar label="Rented" value={propertyStatus.rented || 0} total={totalProps} colorClass="bg-blue-500" />
                <HorizontalBar label="Sold" value={propertyStatus.sold || 0} total={totalProps} colorClass="bg-amber-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/40 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-sky-600">
                  <Eye size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Top Properties</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Most viewed listings</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 dark:border-white/5">
                    <th className="px-8 py-6 text-left">Property</th>
                    <th className="px-8 py-6 text-left">Views</th>
                    <th className="px-8 py-6 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                  {topProperties.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-8 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-[24px] flex items-center justify-center text-slate-300 mb-4">
                            <Home size={32} />
                          </div>
                          <p className="text-sm font-black text-slate-400">No property data available</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    topProperties.map((p, idx) => (
                      <motion.tr
                        key={p._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-slate-50/80 dark:hover:bg-white/2 transition-colors"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xs font-black text-slate-400">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{p.title}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <Eye size={16} className="text-slate-400" />
                            <span className="font-black text-slate-700 dark:text-white">{p.views || 0}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${p.status === "available"
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20"
                            : p.status === "rented"
                              ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 border border-blue-100 dark:border-blue-500/20"
                              : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-100 dark:border-amber-500/20"
                            }`}>
                            {p.status === "available" ? <CheckCircle2 size={14} /> : p.status === "rented" ? <Clock size={14} /> : <Home size={14} />}
                            {p.status || "unknown"}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
