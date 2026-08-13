"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, Search, Calendar, Clock, User, Phone, Building2, CheckCircle2, XCircle, Plus, X, Loader2 } from "lucide-react";
import axios from "@/lib/axios";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const STATUS_OPTIONS = ["pending", "confirmed", "completed", "cancelled"];

const STATUS_BADGES = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  completed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
};

export default function SellerVisits() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newVisit, setNewVisit] = useState({
    visitorName: "",
    visitorPhone: "",
    propertyId: "",
    preferredDate: "",
    preferredTime: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['seller-visits'],
    queryFn: async () => {
      const response = await axios.get('/visits');
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: propertiesData } = useQuery({
    queryKey: ['seller-properties-list'],
    queryFn: async () => {
      const response = await axios.get('/properties/seller');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const visits = Array.isArray(data?.visits) ? data.visits : Array.isArray(data) ? data : [];
  const properties = Array.isArray(propertiesData?.properties) ? propertiesData.properties :
    Array.isArray(propertiesData) ? propertiesData : [];

  const filteredVisits = visits.filter(v => {
    const matchesSearch = v.visitorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.visitorPhone?.includes(searchTerm) ||
      v.property?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`/visits/${id}`, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ['seller-visits'] });
      toast.success(`Visit ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update visit");
    }
  };

  const scheduleVisit = async (e) => {
    e.preventDefault();
    if (!newVisit.visitorName || !newVisit.preferredDate || !newVisit.propertyId) {
      toast.error("Please fill in required fields");
      return;
    }
    try {
      setSubmitting(true);
      await axios.post('/visits', newVisit);
      queryClient.invalidateQueries({ queryKey: ['seller-visits'] });
      toast.success("Visit scheduled");
      setShowModal(false);
      setNewVisit({ visitorName: "", visitorPhone: "", propertyId: "", preferredDate: "", preferredTime: "", notes: "" });
    } catch (err) {
      toast.error("Failed to schedule visit");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="section-title">Site Visits</h2>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search visitor or property..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={16} /> Schedule
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 ${
              statusFilter === s
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                : "btn-secondary text-xs py-2"
            }`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      <div className="app-card overflow-hidden">
        {filteredVisits.length === 0 ? (
          <div className="text-center py-16">
            <CalendarCheck className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-white">No visits found</h3>
            <p className="section-subtitle text-sm mt-2">Schedule your first site visit to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/50 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="text-left px-5 py-4">Visitor</th>
                  <th className="text-left px-5 py-4">Property</th>
                  <th className="text-left px-5 py-4">Date & Time</th>
                  <th className="text-left px-5 py-4">Status</th>
                  <th className="text-right px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredVisits.map((visit) => (
                    <motion.tr
                      layout
                      key={visit._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-600 flex-shrink-0">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-slate-900 dark:text-white">{visit.visitorName || "Unknown"}</p>
                            {visit.visitorPhone && (
                              <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                <Phone size={10} /> {visit.visitorPhone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <Building2 size={14} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">{visit.property?.title || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1 text-sm font-medium">
                          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Calendar size={14} className="text-slate-400" />
                            {visit.preferredDate ? new Date(visit.preferredDate).toLocaleDateString() : "-"}
                          </span>
                          {visit.preferredTime && (
                            <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                              <Clock size={12} /> {visit.preferredTime}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGES[visit.status] || "bg-slate-100 text-slate-600"}`}>
                          {visit.status || "pending"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {visit.status === "pending" && (
                            <>
                              <button onClick={() => updateStatus(visit._id, "confirmed")} className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition active:scale-95" title="Confirm">
                                <CheckCircle2 size={16} />
                              </button>
                              <button onClick={() => updateStatus(visit._id, "cancelled")} className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition active:scale-95" title="Cancel">
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {visit.status === "confirmed" && (
                            <button onClick={() => updateStatus(visit._id, "completed")} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider transition active:scale-95">
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => !submitting && setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg app-card overflow-hidden shadow-2xl"
            >
              <div className="h-1.5 bg-indigo-600 w-full" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Schedule Visit</h3>
                  <button onClick={() => !submitting && setShowModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={scheduleVisit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Visitor Name *</label>
                    <input type="text" value={newVisit.visitorName} onChange={(e) => setNewVisit({ ...newVisit, visitorName: e.target.value })} className="input-field" placeholder="John Doe" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Visitor Phone</label>
                    <input type="text" value={newVisit.visitorPhone} onChange={(e) => setNewVisit({ ...newVisit, visitorPhone: e.target.value })} className="input-field" placeholder="+1 234 567 890" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Property *</label>
                    <select value={newVisit.propertyId} onChange={(e) => setNewVisit({ ...newVisit, propertyId: e.target.value })} className="input-field">
                      <option value="">Select property</option>
                      {properties.map((p) => (
                        <option key={p._id} value={p._id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Date *</label>
                      <input type="date" value={newVisit.preferredDate} onChange={(e) => setNewVisit({ ...newVisit, preferredDate: e.target.value })} className="input-field" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Time</label>
                      <input type="time" value={newVisit.preferredTime} onChange={(e) => setNewVisit({ ...newVisit, preferredTime: e.target.value })} className="input-field" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Notes</label>
                    <textarea value={newVisit.notes} onChange={(e) => setNewVisit({ ...newVisit, notes: e.target.value })} className="input-field resize-none h-20" placeholder="Any special requests..." />
                  </div>
                  <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-3.5 shadow-lg">
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <CalendarCheck size={18} />}
                    {submitting ? "Scheduling..." : "Schedule Visit"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
