"use client";

import filterUiStyles from "@/components/filters/Filters.module.css";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import {
  Plus, Star, Trash2, Edit2, Search, RefreshCcw,
  MessageSquare, Heart, Eye, EyeOff, X, LoaderCircle
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
  const [isDeleting, setIsDeleting] = useState(false);
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
    if (isDeleting) return;
    setIsDeleting(true);
    const loading = toast.loading("Deleting testimonial...");
    try {
      await axios.delete(`/admin/testimonials/${deleteConfig.id}`);
      toast.success("Testimonial deleted.", { id: loading });
      fetchTestimonials();
    } catch {
      toast.error("Delete failed.", { id: loading });
    } finally {
      setIsDeleting(false);
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
    { label: "Total", count: testimonials.length, icon: MessageSquare, color: "text-indigo-600 dark:text-indigo-300" },
    { label: "Active", count: testimonials.filter(t => t.isActive).length, icon: Eye, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Featured", count: testimonials.filter(t => t.isFeatured).length, icon: Heart, color: "text-rose-600 dark:text-rose-400" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Testimonials</h2>
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

      <div role="group" aria-label="Testimonial statistics" className="grid grid-cols-3 gap-2 sm:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="min-w-0 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm dark:border-white/5 dark:bg-slate-800/40 sm:p-4">
            <div className="flex items-center justify-between gap-1">
              <p className="min-w-0 text-[11px] font-semibold text-slate-500 dark:text-slate-400 sm:text-sm">{s.label}</p>
              <s.icon size={16} aria-hidden="true" className={"shrink-0 " + s.color} />
            </div>
            <p className="mt-2 text-2xl font-bold leading-none tabular-nums text-slate-900 dark:text-white sm:text-3xl">{s.count}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 p-3 sm:p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm">
        <div className="relative min-w-0 flex-1">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            aria-label="Search testimonials"
            placeholder="Search by name or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={"w-full pl-14 pr-6 py-3.5 bg-slate-50 dark:bg-white/5 border-none rounded-xl md:rounded-2xl text-[13px] md:text-sm font-bold text-slate-700 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all" + " " + filterUiStyles.filterControl}
          />
        </div>
        <Button onClick={fetchTestimonials} aria-label="Refresh testimonials" variant="outline" size="icon" className="h-11 w-11 shrink-0 rounded-xl text-slate-500 hover:text-indigo-600">
          <RefreshCcw size={18} aria-hidden="true" />
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
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
                            className={`w-9 h-9 flex items-center justify-center rounded-xl shadow-sm border transition-all active:scale-90 ${
                              t.isActive
                                ? "bg-white dark:bg-slate-800 text-slate-400 hover:bg-amber-500 hover:text-white border-slate-100 dark:border-white/5"
                                : "bg-white dark:bg-slate-800 text-slate-400 hover:bg-emerald-500 hover:text-white border-slate-100 dark:border-white/5"
                            }`}
                            aria-label={(t.isActive ? "Deactivate" : "Activate") + " testimonial from " + t.name}
                            title={t.isActive ? "Deactivate" : "Activate"}
                          >
                            {t.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                          <button
                            aria-label={"Edit testimonial from " + t.name}
                            onClick={() => handleEdit(t)}
                            className="w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-xl shadow-sm border border-slate-100 dark:border-white/5 transition-all active:scale-90"
                          >
                            <Edit2 size={18} />
                          </button>
                          <Button
                            onClick={() => handleDelete(t)}
                            aria-label={"Delete testimonial from " + t.name}
                            title="Delete testimonial"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-xl border-rose-100 bg-white text-rose-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-500/20 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-500/10"
                          >
                            <Trash2 size={18} aria-hidden="true" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900 dark:text-white">{filtered.length}</span> of <span className="text-slate-900 dark:text-white">{testimonials.length}</span> testimonials
          </p>
        </div>
      </div>

      {/* Portalled dialog stays outside the animated admin layout. */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent showCloseButton={false} className="flex max-h-[calc(100dvh_-_2rem)] flex-col gap-0 overflow-hidden rounded-3xl bg-white p-0 text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-white sm:max-w-2xl">
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 p-5 dark:border-white/5 dark:bg-white/5 sm:p-6">
            <div className="min-w-0 space-y-1.5">
              <DialogTitle className="text-xl font-black sm:text-2xl">{isEditMode ? "Edit Testimonial" : "New Testimonial"}</DialogTitle>
              <DialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400">Share client success stories.</DialogDescription>
            </div>
            <DialogClose aria-label="Close testimonial form" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm transition-colors hover:text-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 dark:bg-slate-800">
              <X size={20} />
            </DialogClose>
          </div>

          <div data-testimonial-form-body className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5 sm:p-6 custom-scrollbar">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400" htmlFor="testimonial-name">Full Name</label>
                    <input id="testimonial-name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400" htmlFor="testimonial-photo">Photo URL</label>
                    <input id="testimonial-photo" name="photo" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} placeholder="https://..." className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400" htmlFor="testimonial-content">Content</label>
                  <textarea id="testimonial-content" name="content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} placeholder="Write the testimonial..." className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none" />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400" htmlFor="testimonial-designation">Designation</label>
                    <input id="testimonial-designation" name="designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="CEO" className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400" htmlFor="testimonial-company">Company</label>
                    <input id="testimonial-company" name="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Inc." className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="testimonial-rating" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rating (1-5)</label>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                      <input id="testimonial-rating" type="range" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })} className="min-w-0 flex-1 accent-indigo-600" />
                      <span className="font-black text-indigo-600 text-sm w-4">{form.rating}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400" htmlFor="testimonial-displayOrder">Display Order</label>
                    <input type="number" id="testimonial-displayOrder" name="displayOrder" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })} className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                  </div>
                  <div className="space-y-2 flex flex-col justify-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Featured</label>
                    <button
                      type="button"
                      aria-pressed={form.isFeatured}
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
                    role="switch"
                    aria-label="Active status"
                    aria-checked={form.isActive}
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`relative w-14 h-7 rounded-full transition-all ${form.isActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`}
                  >
                    <div className={`absolute w-5 h-5 bg-white rounded-full top-1 shadow transition-all ${form.isActive ? "left-8" : "left-1"}`} />
                  </button>
                </div>
              </div>

              <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 bg-white p-5 dark:border-white/5 dark:bg-slate-900 sm:flex-row sm:p-6">
                <button onClick={() => setIsModalOpen(false)} className="min-w-0 flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-[20px] font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                  Cancel
                </button>
                <button onClick={handleSubmit} className="min-w-0 flex-1 px-4 py-3 bg-indigo-600 text-white rounded-[20px] font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  {isEditMode ? "Save Changes" : "Create Testimonial"}
                </button>
              </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={(open) => { if (!isDeleting) setIsDeleteModalOpen(open); }}>
        <DialogContent role="alertdialog" showCloseButton={false} className="flex max-h-[calc(100dvh_-_2rem)] flex-col gap-0 overflow-hidden rounded-3xl bg-white p-0 text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-white sm:max-w-md">
          <div className="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                <Trash2 size={24} aria-hidden="true" />
              </span>
              <DialogClose disabled={isDeleting} aria-label="Close delete confirmation" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white">
                <X size={18} aria-hidden="true" />
              </DialogClose>
            </div>
            <DialogTitle className="mt-4 text-xl font-bold leading-snug">Delete testimonial?</DialogTitle>
            <DialogDescription className="mt-2 break-words text-sm leading-6 text-slate-500 dark:text-slate-400">
              Delete the testimonial from <span className="font-semibold text-slate-900 dark:text-white">&quot;{deleteConfig.name}&quot;</span>? This action cannot be undone.
            </DialogDescription>
          </div>
          <div className="flex shrink-0 gap-3 border-t border-slate-100 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-white/5 sm:px-6">
            <DialogClose render={<Button variant="outline" />} disabled={isDeleting} className="h-11 min-w-0 flex-1 rounded-xl">Cancel</DialogClose>
            <Button onClick={confirmDelete} disabled={isDeleting} className="h-11 min-w-0 flex-1 gap-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700">
              {isDeleting ? <LoaderCircle size={16} aria-hidden="true" className="animate-spin" /> : <Trash2 size={16} aria-hidden="true" />}
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
