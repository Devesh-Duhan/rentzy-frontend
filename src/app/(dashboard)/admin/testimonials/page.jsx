"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Plus, Star, Trash2, Edit2, Search, RefreshCcw,
  MessageSquare, Heart, Eye, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "@/lib/axios";
import toast from "react-hot-toast";

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "", photo: "", rating: 5, content: "",
    designation: "", company: "", isActive: true, isFeatured: false, displayOrder: 0
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ id: null, name: "" });

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get("/admin/testimonials");
      setTestimonials(data);
    } catch {
      toast.error("Failed to fetch testimonials.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.content) {
      toast.error("Name and content are required.");
      return;
    }
    const loading = toast.loading(isEditMode ? "Updating testimonial..." : "Creating testimonial...");
    try {
      if (isEditMode) {
        await axios.put(`/admin/testimonials/${editingId}`, form);
        toast.success("Testimonial updated.", { id: loading });
      } else {
        await axios.post("/admin/testimonials", form);
        toast.success("Testimonial created.", { id: loading });
      }
      fetchTestimonials();
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed.", { id: loading });
    }
  };

  const handleEdit = (t) => {
    setEditingId(t._id);
    setIsEditMode(true);
    setForm({
      name: t.name, photo: t.photo || "", rating: t.rating, content: t.content,
      designation: t.designation || "", company: t.company || "",
      isActive: t.isActive ?? true, isFeatured: t.isFeatured ?? false, displayOrder: t.displayOrder ?? 0
    });
    setIsModalOpen(true);
  };

  const handleDelete = (t) => {
    setDeleteConfig({ id: t._id, name: t.name });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    const loading = toast.loading("Deleting testimonial...");
    try {
      await axios.delete(`/admin/testimonials/${deleteConfig.id}`);
      toast.success("Testimonial deleted.", { id: loading });
      fetchTestimonials();
    } catch {
      toast.error("Delete failed.", { id: loading });
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const toggleActive = async (t) => {
    try {
      await axios.put(`/admin/testimonials/${t._id}`, { ...t, isActive: !t.isActive });
      toast.success(t.isActive ? "Deactivated" : "Activated");
      fetchTestimonials();
    } catch {
      toast.error("Toggle failed.");
    }
  };

  const filtered = testimonials.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: "Total", count: testimonials.length, icon: MessageSquare, color: "indigo" },
    { label: "Active", count: testimonials.filter(t => t.isActive).length, icon: Eye, color: "emerald" },
    { label: "Featured", count: testimonials.filter(t => t.isFeatured).length, icon: Heart, color: "rose" },
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Testimonials</h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold mt-2">Manage client testimonials and reviews.</p>
        </div>
        <button
          onClick={() => {
            setIsEditMode(false);
            setForm({ name: "", photo: "", rating: 5, content: "", designation: "", company: "", isActive: true, isFeatured: false, displayOrder: 0 });
            setIsModalOpen(true);
          }}
          className="w-full md:w-auto px-6 md:px-8 py-3.5 md:py-4 bg-indigo-600 text-white rounded-[20px] md:rounded-[24px] font-black text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 shadow-2xl shadow-indigo-100 dark:shadow-none hover:bg-slate-900 transition-all"
        >
          <Plus size={18} /> Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 md:p-8 bg-white dark:bg-slate-800/40 rounded-[24px] md:rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
          >
            <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity text-${s.color}-600`}>
              <s.icon size={120} className="w-20 h-20 md:w-30 md:h-30" />
            </div>
            <div className={`w-10 h-10 md:w-14 md:h-14 bg-${s.color}-50 dark:bg-${s.color}-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-${s.color}-600 mb-4 md:mb-6 group-hover:scale-110 transition-transform`}>
              <s.icon size={28} className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
            <h4 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white">{s.count}</h4>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white dark:bg-slate-900/50 rounded-[32px] border border-slate-100 dark:border-white/10 shadow-sm backdrop-blur-3xl">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-3.5 bg-slate-50 dark:bg-white/5 border-none rounded-xl md:rounded-2xl text-[13px] md:text-sm font-bold text-slate-700 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
          />
        </div>
        <button onClick={fetchTestimonials} className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-indigo-600 transition-all active:scale-90">
          <RefreshCcw size={20} />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800/40 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 dark:border-white/5">
                <th className="px-10 py-6 text-left">Client</th>
                <th className="px-8 py-6 text-left">Rating</th>
                <th className="px-8 py-6 text-left">Content</th>
                <th className="px-8 py-6 text-left">Status</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              <AnimatePresence>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-10 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading testimonials...</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-10 py-24 text-center">
                      <div className="max-w-xs mx-auto flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-[32px] flex items-center justify-center text-slate-300 mb-6">
                          <MessageSquare size={40} />
                        </div>
                        <h5 className="text-xl font-black text-slate-700 dark:text-white">No Testimonials</h5>
                        <p className="text-slate-400 font-bold text-sm mt-2">No testimonials match your search.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((t, idx) => (
                    <motion.tr
                      key={t._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group hover:bg-slate-50/80 dark:hover:bg-white/2 transition-colors"
                    >
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-[20px] bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-100 dark:shadow-none overflow-hidden border-2 border-white dark:border-slate-800 group-hover:scale-105 transition-transform shrink-0">
                            {t.photo ? <Image src={t.photo} width={56} height={56} className="w-full h-full object-cover" alt="" unoptimized /> : t.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 dark:text-white text-base tracking-tight leading-none mb-1">{t.name}</div>
                            {(t.designation || t.company) && (
                              <div className="text-xs font-bold text-slate-400 leading-tight">
                                {t.designation}{t.designation && t.company ? ", " : ""}{t.company}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex text-amber-500 gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className={i < t.rating ? "fill-amber-500" : "text-slate-200 dark:text-slate-600"} />
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 max-w-[240px] truncate">
                          {t.content}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${t.isActive
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20"
                            : "bg-slate-50 dark:bg-white/5 text-slate-400 border-slate-100 dark:border-white/10"
                          }`}>
                            {t.isActive ? "Active" : "Inactive"}
                          </span>
                          {t.isFeatured && (
                            <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-100 dark:border-rose-500/20">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toggleActive(t)}
                            className={`w-11 h-11 flex items-center justify-center rounded-xl shadow-sm border transition-all active:scale-90 ${
                              t.isActive
                                ? "bg-white dark:bg-slate-800 text-slate-400 hover:bg-amber-500 hover:text-white border-slate-100 dark:border-white/5"
                                : "bg-white dark:bg-slate-800 text-slate-400 hover:bg-emerald-500 hover:text-white border-slate-100 dark:border-white/5"
                            }`}
                            title={t.isActive ? "Deactivate" : "Activate"}
                          >
                            {t.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                          <button
                            onClick={() => handleEdit(t)}
                            className="w-11 h-11 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-xl shadow-sm border border-slate-100 dark:border-white/5 transition-all active:scale-90"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(t)}
                            className="w-11 h-11 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-400 hover:bg-rose-600 hover:text-white rounded-xl shadow-sm border border-slate-100 dark:border-white/5 transition-all active:scale-90"
                          >
                            <Trash2 size={18} />
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

        <div className="p-8 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900 dark:text-white">{filtered.length}</span> of <span className="text-slate-900 dark:text-white">{testimonials.length}</span> testimonials
          </p>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 bottom-8 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2 w-[calc(100%-32px)] md:max-w-xl bg-white dark:bg-slate-900 z-[110] rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-slate-100 dark:border-white/10 max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-50 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">{isEditMode ? "Edit Testimonial" : "New Testimonial"}</h3>
                  <p className="text-sm text-slate-500 font-medium">Share client success stories.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-rose-500 transition-colors shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                    <input name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Photo URL</label>
                    <input name="photo" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} placeholder="https://..." className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Content</label>
                  <textarea name="content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} placeholder="Write the testimonial..." className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Designation</label>
                    <input name="designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="CEO" className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Company</label>
                    <input name="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Inc." className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rating (1-5)</label>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                      <input type="range" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })} className="flex-1 accent-indigo-600" />
                      <span className="font-black text-indigo-600 text-sm w-4">{form.rating}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Display Order</label>
                    <input type="number" name="displayOrder" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })} className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                  </div>
                  <div className="space-y-2 flex flex-col justify-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Featured</label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isFeatured: !form.isFeatured })}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all font-black text-sm ${
                        form.isFeatured
                          ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 border-rose-100 dark:border-rose-500/20"
                          : "bg-slate-50 dark:bg-white/5 text-slate-400 border-slate-100 dark:border-white/10"
                      }`}
                    >
                      <Heart size={18} className={form.isFeatured ? "fill-rose-500" : ""} />
                      {form.isFeatured ? "Featured" : "Set as Featured"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Status</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`relative w-14 h-7 rounded-full transition-all ${form.isActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`}
                  >
                    <div className={`absolute w-5 h-5 bg-white rounded-full top-1 shadow transition-all ${form.isActive ? "left-8" : "left-1"}`} />
                  </button>
                </div>
              </div>

              <div className="p-8 border-t border-slate-50 dark:border-white/5 flex gap-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-[20px] font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                  Cancel
                </button>
                <button onClick={handleSubmit} className="flex-1 py-4 bg-indigo-600 text-white rounded-[20px] font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  {isEditMode ? "Save Changes" : "Create Testimonial"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 bottom-8 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2 w-[calc(100%-32px)] md:max-w-md bg-white dark:bg-slate-900 z-[110] rounded-[32px] shadow-2xl overflow-hidden p-6 md:p-8 border border-slate-100 dark:border-white/10 text-center"
            >
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Delete Testimonial?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8">
                Delete testimonial from <span className="text-slate-900 dark:text-white font-bold">"{deleteConfig.name}"</span>? This cannot be undone.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all">Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
