"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Search, ChevronDown, ChevronUp, Plus, Mail, Phone, User, Building2, Calendar, Loader2 } from "lucide-react";
import axios from "@/lib/axios";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const STATUS_OPTIONS = ["new", "contacted", "qualified", "converted", "closed"];

const STATUS_BADGES = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  contacted: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  qualified: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  converted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  closed: "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400",
};

const SOURCE_BADGES = {
  website: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  referral: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  phone: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  walkin: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  social: "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
};

export default function SellerLeads() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedRow, setExpandedRow] = useState(null);
  const [noteInputs, setNoteInputs] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['seller-leads'],
    queryFn: async () => {
      const response = await axios.get('/leads');
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const leads = Array.isArray(data?.leads) ? data.leads : Array.isArray(data) ? data : [];

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`/leads/${id}`, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ['seller-leads'] });
      toast.success("Status updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const addNote = async (leadId) => {
    const note = noteInputs[leadId]?.trim();
    if (!note) return;
    try {
      await axios.post(`/leads/${leadId}/notes`, { text: note });
      queryClient.invalidateQueries({ queryKey: ['seller-leads'] });
      setNoteInputs(prev => ({ ...prev, [leadId]: "" }));
      toast.success("Note added");
    } catch (err) {
      toast.error("Failed to add note");
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
        <h2 className="section-title">Lead Management</h2>
        <div className="relative flex-1 md:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
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
        {filteredLeads.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-white">No leads found</h3>
            <p className="section-subtitle text-sm mt-2">{searchTerm ? "No leads match your search." : "No leads have come in yet for your properties."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/50 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="text-left px-5 py-4">Lead</th>
                  <th className="text-left px-5 py-4">Property</th>
                  <th className="text-left px-5 py-4">Source</th>
                  <th className="text-left px-5 py-4">Status</th>
                  <th className="text-left px-5 py-4">Date</th>
                  <th className="w-10 px-5 py-4"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredLeads.map((lead) => (
                    <motion.tr
                      layout
                      key={lead._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-slate-900 dark:text-white">{lead.name || "Unknown"}</p>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400 font-medium">
                              <span className="flex items-center gap-1"><Mail size={10} /> {lead.email || "-"}</span>
                              <span className="flex items-center gap-1"><Phone size={10} /> {lead.phone || "-"}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <Building2 size={14} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">{lead.property?.title || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${SOURCE_BADGES[lead.source] || "bg-slate-100 text-slate-600 dark:bg-slate-500/10"}`}>
                          {lead.source || "website"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={lead.status}
                          onChange={(e) => updateStatus(lead._id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer border-0 ${STATUS_BADGES[lead.status] || "bg-slate-100 text-slate-600"}`}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                          <Calendar size={14} />
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "-"}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setExpandedRow(expandedRow === lead._id ? null : lead._id)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition"
                        >
                          {expandedRow === lead._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
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
        {expandedRow && (() => {
          const lead = leads.find(l => l._id === expandedRow);
          if (!lead) return null;
          return (
            <motion.div
              key={expandedRow}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="app-card p-6 overflow-hidden"
            >
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <MessageSquare size={18} className="text-indigo-600" /> Notes & Activity
              </h4>
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {lead.notes && lead.notes.length > 0 ? (
                  lead.notes.map((note, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                      <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-600 flex-shrink-0 text-xs font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">{note.text}</p>
                        <p className="text-xs text-slate-400 font-medium mt-1">
                          {note.createdAt ? new Date(note.createdAt).toLocaleString() : ""}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm font-medium">No notes yet. Add the first note below.</p>
                )}
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Write a note..."
                  value={noteInputs[lead._id] || ""}
                  onChange={(e) => setNoteInputs(prev => ({ ...prev, [lead._id]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addNote(lead._id)}
                  className="input-field flex-1"
                />
                <button
                  onClick={() => addNote(lead._id)}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Plus size={16} /> Add Note
                </button>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
