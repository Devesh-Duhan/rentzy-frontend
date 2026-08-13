"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Search, Filter, Loader2, User, Activity, Target, Calendar } from "lucide-react";
import axios from "@/lib/axios";
import toast from "react-hot-toast";

const ACTION_TYPES = [
  { value: "all", label: "All Actions" },
  { value: "toggle_featured", label: "Featured Toggle" },
  { value: "verify", label: "Verification" },
  { value: "reject", label: "Rejection" },
  { value: "update_settings", label: "Settings Update" },
];

export default function ActivityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter !== "all") params.set("action", actionFilter);
      if (search) params.set("search", search);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const res = await axios.get(`/admin/activity?${params.toString()}`);
      setLogs(res.data);
    } catch {
      toast.error("Failed to load activity log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchLogs(), 300);
    return () => clearTimeout(t);
  }, [actionFilter, startDate, endDate]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    if (!search && search !== "") return;
    const t = setTimeout(() => fetchLogs(), 300);
    return () => clearTimeout(t);
  }, [search]);

  const getActionBadge = (action) => {
    switch (action) {
      case "verify":
        return "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "reject":
        return "bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400";
      case "toggle_featured":
        return "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400";
      case "update_settings":
        return "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400";
      default:
        return "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400";
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Activity Log</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Track all admin actions and system changes</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Search by user, target..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all appearance-none"
        >
          {ACTION_TYPES.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all"
        />
        <span className="text-slate-400 text-sm font-bold">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500 font-bold">
          <Activity size={48} className="mx-auto mb-4 opacity-50" />
          <p>No activity recorded yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const user = log.user || {};
            return (
              <motion.div
                key={log._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 mt-0.5">
                  {user.name?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm text-slate-900 dark:text-white">{user.name || "Unknown"}</span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getActionBadge(log.action)}`}>
                      {log.action.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {log.details}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] font-medium text-slate-400">
                    <span className="flex items-center gap-1">
                      <Target size={12} /> {log.target || "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
