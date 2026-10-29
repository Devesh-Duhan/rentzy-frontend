"use client";

import filterUiStyles from "@/components/filters/Filters.module.css";
import { Fragment, useState, useEffect } from "react";
import {
  Search, RefreshCcw, Mail, Phone, Calendar, ChevronDown, ChevronUp,
  MessageSquare, User as UserIcon, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "@/lib/axios";
import toast from "react-hot-toast";

const STATUSES = ["new", "contacted", "qualified", "converted", "closed"];
const STATUS_STYLES = {
  new: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 border-blue-100 dark:border-blue-500/20",
  contacted: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-100 dark:border-amber-500/20",
  qualified: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 border-indigo-100 dark:border-indigo-500/20",
  converted: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20",
  closed: "bg-slate-50 dark:bg-white/5 text-slate-500 border-slate-100 dark:border-white/10",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const [noteText, setNoteText] = useState("");

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get("/admin/leads");
      setLeads(data);
    } catch {
      toast.error("Failed to fetch leads.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const updateStatus = async (id, status) => {
    const loading = toast.loading("Updating status...");
    try {
      await axios.put(`/admin/leads/${id}/status`, { status });
      toast.success(`Status changed to ${status}.`, { id: loading });
      fetchLeads();
    } catch {
      toast.error("Status update failed.", { id: loading });
    }
  };

  const addNote = async (id) => {
    if (!noteText.trim()) return;
    const loading = toast.loading("Adding note...");
    try {
      await axios.post(`/admin/leads/${id}/notes`, { text: noteText });
      toast.success("Note added.", { id: loading });
      setNoteText("");
      fetchLeads();
    } catch {
      toast.error("Failed to add note.", { id: loading });
    }
  };

  const filtered = leads.filter((lead) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      lead.name?.toLowerCase().includes(q) ||
      lead.email?.toLowerCase().includes(q) ||
      lead.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: "Total", count: leads.length, color: "indigo" },
    { label: "New", count: leads.filter((l) => l.status === "new").length, color: "blue" },
    { label: "Contacted", count: leads.filter((l) => l.status === "contacted").length, color: "amber" },
    { label: "Qualified", count: leads.filter((l) => l.status === "qualified").length, color: "indigo" },
    { label: "Converted", count: leads.filter((l) => l.status === "converted").length, color: "emerald" },
    { label: "Closed", count: leads.filter((l) => l.status === "closed").length, color: "slate" },
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Lead Management</h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold mt-2">Track and manage incoming leads.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {stats.map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 md:p-5 bg-white dark:bg-slate-800/40 rounded-[20px] md:rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm text-center hover:shadow-lg transition-all"
          >
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
            <h4 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white">{s.count}</h4>
          </motion.div>
        ))}
      </div>

      <div className={"flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white dark:bg-slate-900/50 rounded-[32px] border border-slate-100 dark:border-white/10 shadow-sm backdrop-blur-3xl" + " " + filterUiStyles.toolbar}>
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={"w-full pl-14 pr-6 py-3.5 bg-slate-50 dark:bg-white/5 border-none rounded-xl md:rounded-2xl text-[13px] md:text-sm font-bold text-slate-700 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all" + " " + filterUiStyles.filterControl}
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={"appearance-none pl-5 pr-10 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-2xl text-sm font-black text-slate-600 dark:text-slate-300 outline-none focus:border-indigo-500 transition-all cursor-pointer w-full" + " " + filterUiStyles.filterControl}
            >
              <option value="All">All Status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <button onClick={fetchLeads} className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-indigo-600 transition-all active:scale-90">
            <RefreshCcw size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800/40 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 dark:border-white/5">
                <th className="px-10 py-6 text-left">Lead</th>
                <th className="px-8 py-6 text-left">Contact</th>
                <th className="px-8 py-6 text-left">Source</th>
                <th className="px-8 py-6 text-left">Status</th>
                <th className="px-8 py-6 text-left">Created</th>
                <th className="px-10 py-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              <AnimatePresence>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-10 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading leads...</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-10 py-24 text-center">
                      <div className="max-w-xs mx-auto flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-[32px] flex items-center justify-center text-slate-300 mb-6">
                          <UserIcon size={40} />
                        </div>
                        <h5 className="text-xl font-black text-slate-700 dark:text-white">No Leads Found</h5>
                        <p className="text-slate-400 font-bold text-sm mt-2">No leads match your search or filter.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((lead) => (
                    <Fragment key={lead._id}>
                      <tr
                        onClick={() => setExpandedId(expandedId === lead._id ? null : lead._id)}
                        className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-white/2 transition-colors"
                      >
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-lg font-black shadow-lg shrink-0">
                              {lead.name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <div className="font-black text-slate-900 dark:text-white text-base tracking-tight leading-none mb-1">{lead.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                              <Mail size={12} className="text-slate-400" />
                              {lead.email}
                            </div>
                            {lead.phone && (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                                <Phone size={12} className="text-slate-400" />
                                {lead.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          {lead.source && (
                            <span className="inline-flex px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-white/10">
                              {lead.source}
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLES[lead.status] || STATUS_STYLES.new}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                            <Calendar size={12} className="text-slate-400" />
                            {new Date(lead.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                          </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                          {expandedId === lead._id ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                        </td>
                      </tr>
                      <AnimatePresence>
                        {expandedId === lead._id && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <td colSpan="6" className="px-10 py-6 bg-slate-50/50 dark:bg-white/2">
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                              >
                                {/* Details */}
                                <div className="space-y-6">
                                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Lead Details</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Email</p>
                                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{lead.email}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Phone</p>
                                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{lead.phone || "—"}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Source</p>
                                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{lead.source || "—"}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Created</p>
                                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                        {new Date(lead.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Update Status */}
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Update Status</label>
                                    <select
                                      value={lead.status}
                                      onChange={(e) => updateStatus(lead._id, e.target.value)}
                                      className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-2xl text-sm font-black text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
                                    >
                                      {STATUSES.map((s) => (
                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-4">
                                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Notes</h4>
                                  <div className="flex gap-3">
                                    <textarea
                                      value={noteText}
                                      onChange={(e) => setNoteText(e.target.value)}
                                      placeholder="Add a note..."
                                      rows={3}
                                      className="flex-1 p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                                    />
                                    <button
                                      onClick={() => addNote(lead._id)}
                                      disabled={!noteText.trim()}
                                      className="px-5 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed self-end"
                                    >
                                      <MessageSquare size={18} />
                                    </button>
                                  </div>

                                  {/* Existing Notes */}
                                  {lead.notes && lead.notes.length > 0 && (
                                    <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                      {lead.notes.map((note, i) => (
                                        <div key={i} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5">
                                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{note.text}</p>
                                          <p className="text-[10px] font-bold text-slate-400 mt-2">
                                            {new Date(note.addedAt || note.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {(!lead.notes || lead.notes.length === 0) && (
                                    <p className="text-sm text-slate-400 italic font-medium">No notes yet.</p>
                                  )}
                                </div>
                              </motion.div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </Fragment>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900 dark:text-white">{filtered.length}</span> of <span className="text-slate-900 dark:text-white">{leads.length}</span> leads
          </p>
        </div>
      </div>
    </div>
  );
}
