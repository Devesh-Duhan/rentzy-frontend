"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Search,
  Trash2,
  Download,
  RefreshCcw,
  Users,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "@/lib/axios";
import { toast } from "react-hot-toast";

export default function NewsletterManagement() {
  const [subscribers, setSubscribers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchSubscribers = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get("/admin/newsletter");
      setSubscribers(Array.isArray(data) ? data : data.subscribers || []);
    } catch {
      toast.error("Failed to fetch subscribers.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id) => {
    const loading = toast.loading("Removing subscriber...");
    try {
      await axios.delete(`/admin/newsletter/${id}`);
      toast.success("Subscriber removed.", { id: loading });
      setDeleteConfirmId(null);
      fetchSubscribers();
    } catch {
      toast.error("Failed to remove subscriber.", { id: loading });
    }
  };

  const exportCSV = () => {
    const headers = ["Email", "Name", "Subscribed Date", "Active"];
    const rows = filteredSubscribers.map((s) => [
      s.email,
      s.name || "",
      new Date(s.createdAt || s.subscribedAt).toLocaleDateString("en-GB"),
      s.active !== false ? "Yes" : "No",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully.");
  };

  const filteredSubscribers = subscribers.filter((s) => {
    const term = searchTerm.toLowerCase();
    return s.email?.toLowerCase().includes(term) || s.name?.toLowerCase().includes(term);
  });

  const stats = [
    { label: "Total Subscribers", count: subscribers.length, icon: Users, color: "indigo" },
    { label: "Active", count: subscribers.filter((s) => s.active !== false).length, icon: CheckCircle2, color: "emerald" },
    { label: "Inactive", count: subscribers.filter((s) => s.active === false).length, icon: XCircle, color: "rose" },
    { label: "New This Month", count: subscribers.filter((s) => {
      const d = new Date(s.createdAt || s.subscribedAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length, icon: Mail, color: "amber" },
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Newsletter</h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold mt-2">Manage email subscribers and mailing list.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={exportCSV}
            className="px-6 py-3.5 bg-emerald-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl hover:bg-emerald-700 transition-all"
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            onClick={fetchSubscribers}
            className="p-3.5 bg-indigo-600 text-white rounded-[20px] hover:bg-slate-900 transition-all shadow-2xl"
          >
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-5 md:p-8 bg-white dark:bg-slate-800/40 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all overflow-hidden relative`}
          >
            <div className={`absolute -right-4 -bottom-4 opacity-5 text-${s.color}-600`}>
              <s.icon size={120} />
            </div>
            <div className={`w-10 h-10 md:w-14 md:h-14 bg-${s.color}-50 dark:bg-${s.color}-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-${s.color}-600 mb-4 md:mb-6`}>
              <s.icon size={28} />
            </div>
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
            <h4 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white">{s.count}</h4>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white dark:bg-slate-900/50 rounded-[32px] border border-slate-100 dark:border-white/10 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-3.5 bg-slate-50 dark:bg-white/5 border-none rounded-xl text-sm font-bold text-slate-700 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
          />
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
          {filteredSubscribers.length} of {subscribers.length} subscribers
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800/40 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 dark:border-white/5">
                <th className="px-8 py-6 text-left">Subscriber</th>
                <th className="px-8 py-6 text-left">Email</th>
                <th className="px-8 py-6 text-left">Subscribed Date</th>
                <th className="px-8 py-6 text-left">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              <AnimatePresence>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading subscribers...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-24 text-center">
                      <div className="max-w-xs mx-auto flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-[32px] flex items-center justify-center text-slate-300 mb-6">
                          <Mail size={40} />
                        </div>
                        <h5 className="text-xl font-black text-slate-700 dark:text-white">No Subscribers</h5>
                        <p className="text-slate-400 font-bold text-sm mt-2">No subscribers match your search criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((sub, idx) => (
                    <motion.tr
                      key={sub._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group hover:bg-slate-50/80 dark:hover:bg-white/2 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[16px] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                            <Mail size={22} />
                          </div>
                          <p className="font-black text-slate-900 dark:text-white text-sm">
                            {sub.name || "Anonymous"}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{sub.email}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-white">
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(sub.createdAt || sub.subscribedAt).toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${sub.active !== false
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20"
                          : "bg-slate-50 dark:bg-white/5 text-slate-500 border border-slate-100 dark:border-white/10"
                          }`}>
                          {sub.active !== false ? "Active" : "Inactive"}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {deleteConfirmId === sub._id ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDelete(sub._id)}
                                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-black hover:bg-rose-700 transition-all active:scale-90"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-black hover:bg-slate-200 transition-all active:scale-90"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(sub._id)}
                              className="w-10 h-10 flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all active:scale-90"
                              title="Delete Subscriber"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
