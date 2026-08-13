"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Search,
  Filter,
  RefreshCcw,
  Phone,
  User,
  Home,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Star,
  CalendarCheck,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "@/lib/axios";
import { toast } from "react-hot-toast";
import Link from "next/link";

const STATUS_STYLES = {
  pending: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-100 dark:border-amber-500/20",
  confirmed: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20",
  completed: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 border border-blue-100 dark:border-blue-500/20",
  cancelled: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-100 dark:border-rose-500/20",
};

export default function VisitManagement() {
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [expandedId, setExpandedId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const fetchVisits = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get("/admin/visits");
      setVisits(Array.isArray(data) ? data : data.visits || []);
    } catch {
      toast.error("Failed to fetch visit records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleConfirm = async (id) => {
    const loading = toast.loading("Confirming visit...");
    try {
      await axios.put(`/admin/visits/${id}/status`, { status: "confirmed" });
      toast.success("Visit confirmed successfully.", { id: loading });
      fetchVisits();
    } catch {
      toast.error("Failed to confirm visit.", { id: loading });
    }
  };

  const handleCancel = async (id) => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation.");
      return;
    }
    const loading = toast.loading("Cancelling visit...");
    try {
      await axios.put(`/admin/visits/${id}/status`, { status: "cancelled", reason: cancelReason });
      toast.success("Visit cancelled.", { id: loading });
      setCancellingId(null);
      setCancelReason("");
      fetchVisits();
    } catch {
      toast.error("Failed to cancel visit.", { id: loading });
    }
  };

  const filteredVisits = visits.filter((v) => {
    const matchesSearch =
      v.visitorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.visitorPhone?.includes(searchTerm) ||
      v.property?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || v.status === statusFilter;
    const visitDate = new Date(v.preferredDate);
    const matchesFrom = !dateRange.from || visitDate >= new Date(dateRange.from);
    const matchesTo = !dateRange.to || visitDate <= new Date(dateRange.to + "T23:59:59");
    return matchesSearch && matchesStatus && matchesFrom && matchesTo;
  });

  const stats = [
    { label: "Total Visits", count: visits.length, icon: Calendar, color: "indigo" },
    { label: "Pending", count: visits.filter((v) => v.status === "pending").length, icon: Clock, color: "amber" },
    { label: "Confirmed", count: visits.filter((v) => v.status === "confirmed").length, icon: CalendarCheck, color: "emerald" },
    { label: "Completed", count: visits.filter((v) => v.status === "completed").length, icon: CheckCircle2, color: "blue" },
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Visit Management</h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold mt-2">Schedule, confirm, and track property visits.</p>
        </div>
        <button
          onClick={fetchVisits}
          className="px-6 py-3.5 bg-indigo-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl hover:bg-slate-900 transition-all"
        >
          <RefreshCcw size={16} /> Refresh
        </button>
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
            placeholder="Search by name, phone, or property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-3.5 bg-slate-50 dark:bg-white/5 border-none rounded-xl text-sm font-bold text-slate-700 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Filter size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-12 pr-10 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-2xl text-sm font-black text-slate-600 dark:text-slate-300 outline-none focus:border-indigo-500 transition-all cursor-pointer w-full"
            >
              <option>All</option>
              <option>pending</option>
              <option>confirmed</option>
              <option>completed</option>
              <option>cancelled</option>
            </select>
          </div>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
            className="px-4 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 outline-none focus:border-indigo-500 transition-all"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
            className="px-4 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 outline-none focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800/40 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 dark:border-white/5">
                <th className="px-8 py-6 text-left">Visitor</th>
                <th className="px-8 py-6 text-left">Property</th>
                <th className="px-8 py-6 text-left">Schedule</th>
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
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading visits...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredVisits.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-24 text-center">
                      <div className="max-w-xs mx-auto flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-[32px] flex items-center justify-center text-slate-300 mb-6">
                          <Calendar size={40} />
                        </div>
                        <h5 className="text-xl font-black text-slate-700 dark:text-white">No Visits Found</h5>
                        <p className="text-slate-400 font-bold text-sm mt-2">No visit records match your current filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredVisits.map((visit, idx) => (
                    <motion.tr
                      key={visit._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group hover:bg-slate-50/80 dark:hover:bg-white/2 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[16px] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                            <User size={22} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white text-sm leading-none mb-1">{visit.visitorName}</p>
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Phone size={12} />
                              <span className="text-xs font-bold">{visit.visitorPhone}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <Link
                          href={`/property/${visit.property?._id || visit.property}`}
                          className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <Home size={16} />
                          {visit.property?.title || "View Property"}
                        </Link>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-white">
                            <Calendar size={14} className="text-slate-400" />
                            {new Date(visit.preferredDate).toLocaleDateString("en-GB", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mt-0.5">
                            <Clock size={12} />
                            {visit.preferredTime || "Flexible"}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${STATUS_STYLES[visit.status] || STATUS_STYLES.pending}`}>
                          {visit.status}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {visit.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleConfirm(visit._id)}
                                className="w-10 h-10 flex items-center justify-center bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all active:scale-90"
                                title="Confirm Visit"
                              >
                                <CheckCircle2 size={18} />
                              </button>
                              <button
                                onClick={() => setCancellingId(cancellingId === visit._id ? null : visit._id)}
                                className="w-10 h-10 flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all active:scale-90"
                                title="Cancel Visit"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setExpandedId(expandedId === visit._id ? null : visit._id)}
                            className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-white/5 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all active:scale-90"
                          >
                            {expandedId === visit._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
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

      <AnimatePresence>
        {filteredVisits
          .filter((v) => expandedId === v._id)
          .map((visit) => (
            <motion.div
              key={`details-${visit._id}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-slate-800/40 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm p-8 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Contact Info</p>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-700 dark:text-white flex items-center gap-2">
                      <Phone size={14} className="text-indigo-500" /> {visit.visitorPhone}
                    </p>
                    {visit.visitorEmail && (
                      <p className="text-sm font-bold text-slate-700 dark:text-white">{visit.visitorEmail}</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Visit Details</p>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-700 dark:text-white">
                      {new Date(visit.preferredDate).toLocaleDateString("en-GB", {
                        weekday: "long", day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                    <p className="text-sm font-bold text-slate-700 dark:text-white flex items-center gap-2">
                      <Clock size={14} className="text-indigo-500" /> {visit.preferredTime || "Flexible Timing"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Status History</p>
                  <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${STATUS_STYLES[visit.status]}`}>
                      {visit.status}
                    </div>
                    {visit.cancellationReason && (
                      <p className="text-xs text-rose-500 font-bold">Reason: {visit.cancellationReason}</p>
                    )}
                  </div>
                </div>
              </div>
              {visit.feedback && (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                    <MessageSquare size={14} /> Visitor Feedback
                  </p>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={16}
                          className={s <= (visit.feedback.rating || 0) ? "fill-amber-500" : ""}
                        />
                      ))}
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{visit.feedback.comment}</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
      </AnimatePresence>

      <AnimatePresence>
        {cancellingId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white dark:bg-slate-800/40 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm p-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-600 shrink-0">
                <AlertCircle size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">Cancel Visit</h4>
                <p className="text-sm font-medium text-slate-500 mb-4">Please provide a reason for cancellation.</p>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter cancellation reason..."
                  className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-rose-500/10 transition-all mb-4 resize-none"
                  rows={3}
                />
                <div className="flex gap-4">
                  <button
                    onClick={() => { setCancellingId(null); setCancelReason(""); }}
                    className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleCancel(cancellingId)}
                    className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-black text-sm shadow-lg hover:bg-rose-700 transition-all"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-t border-slate-100 dark:border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Showing <span className="text-slate-900 dark:text-white">{filteredVisits.length}</span> of <span className="text-slate-900 dark:text-white">{visits.length}</span> visits
        </p>
      </div>
    </div>
  );
}
