"use client";

import { useState, useEffect } from "react";
import {
  Plus, Trash2, Edit2, Search, RefreshCcw, HelpCircle, Eye, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "@/lib/axios";
import toast from "react-hot-toast";

const CATEGORIES = ["general", "buying", "selling", "renting", "payment", "account", "property", "legal"];

export default function FaqsPage() {
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    question: "", answer: "", category: "general", displayOrder: 0, isActive: true
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ id: null, question: "" });

  const fetchFaqs = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get("/admin/faqs");
      setFaqs(data);
    } catch {
      toast.error("Failed to fetch FAQs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchFaqs(); }, []);

  const handleSubmit = async () => {
    if (!form.question || !form.answer) {
      toast.error("Question and answer are required.");
      return;
    }
    const loading = toast.loading(isEditMode ? "Updating FAQ..." : "Creating FAQ...");
    try {
      if (isEditMode) {
        await axios.put(`/admin/faqs/${editingId}`, form);
        toast.success("FAQ updated.", { id: loading });
      } else {
        await axios.post("/admin/faqs", form);
        toast.success("FAQ created.", { id: loading });
      }
      fetchFaqs();
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed.", { id: loading });
    }
  };

  const handleEdit = (faq) => {
    setEditingId(faq._id);
    setIsEditMode(true);
    setForm({
      question: faq.question, answer: faq.answer, category: faq.category || "general",
      displayOrder: faq.displayOrder ?? 0, isActive: faq.isActive ?? true
    });
    setIsModalOpen(true);
  };

  const handleDelete = (faq) => {
    setDeleteConfig({ id: faq._id, question: faq.question });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    const loading = toast.loading("Deleting FAQ...");
    try {
      await axios.delete(`/admin/faqs/${deleteConfig.id}`);
      toast.success("FAQ deleted.", { id: loading });
      fetchFaqs();
    } catch {
      toast.error("Delete failed.", { id: loading });
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const toggleActive = async (faq) => {
    try {
      await axios.put(`/admin/faqs/${faq._id}`, { ...faq, isActive: !faq.isActive });
      toast.success(faq.isActive ? "Deactivated" : "Activated");
      fetchFaqs();
    } catch {
      toast.error("Toggle failed.");
    }
  };

  const filtered = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const activeCount = faqs.filter(f => f.isActive).length;

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">FAQ Management</h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold mt-2">
            {faqs.length} total &middot; {activeCount} active
          </p>
        </div>
        <button
          onClick={() => {
            setIsEditMode(false);
            setForm({ question: "", answer: "", category: "general", displayOrder: 0, isActive: true });
            setIsModalOpen(true);
          }}
          className="w-full md:w-auto px-6 md:px-8 py-3.5 md:py-4 bg-indigo-600 text-white rounded-[20px] md:rounded-[24px] font-black text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 shadow-2xl shadow-indigo-100 dark:shadow-none hover:bg-slate-900 transition-all"
        >
          <Plus size={18} /> Add FAQ
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        {["All", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
              activeCategory === cat
                ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-lg"
                : "bg-white dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5"
            }`}
          >
            {cat}
            {cat !== "All" && (
              <span className="ml-2 opacity-60">({faqs.filter(f => f.category === cat).length})</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white dark:bg-slate-900/50 rounded-[32px] border border-slate-100 dark:border-white/10 shadow-sm backdrop-blur-3xl">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions and answers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-3.5 bg-slate-50 dark:bg-white/5 border-none rounded-xl md:rounded-2xl text-[13px] md:text-sm font-bold text-slate-700 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
          />
        </div>
        <button onClick={fetchFaqs} className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-indigo-600 transition-all active:scale-90">
          <RefreshCcw size={20} />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800/40 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 dark:border-white/5">
                <th className="px-10 py-6 text-left">Question</th>
                <th className="px-8 py-6 text-left">Category</th>
                <th className="px-8 py-6 text-left">Order</th>
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
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading FAQs...</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-10 py-24 text-center">
                      <div className="max-w-xs mx-auto flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-[32px] flex items-center justify-center text-slate-300 mb-6">
                          <HelpCircle size={40} />
                        </div>
                        <h5 className="text-xl font-black text-slate-700 dark:text-white">No FAQs Found</h5>
                        <p className="text-slate-400 font-bold text-sm mt-2">No FAQs match your current filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((faq, idx) => (
                    <motion.tr
                      key={faq._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group hover:bg-slate-50/80 dark:hover:bg-white/2 transition-colors"
                    >
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
                            <HelpCircle size={18} />
                          </div>
                          <p className="font-bold text-slate-900 dark:text-white max-w-[400px] truncate">
                            {faq.question}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 border border-indigo-100 dark:border-indigo-500/20">
                          {faq.category}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-slate-700 dark:text-white">#{faq.displayOrder ?? 0}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          faq.isActive
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20"
                            : "bg-slate-50 dark:bg-white/5 text-slate-400 border-slate-100 dark:border-white/10"
                        }`}>
                          {faq.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toggleActive(faq)}
                            className={`w-11 h-11 flex items-center justify-center rounded-xl shadow-sm border transition-all active:scale-90 ${
                              faq.isActive
                                ? "bg-white dark:bg-slate-800 text-slate-400 hover:bg-amber-500 hover:text-white border-slate-100 dark:border-white/5"
                                : "bg-white dark:bg-slate-800 text-slate-400 hover:bg-emerald-500 hover:text-white border-slate-100 dark:border-white/5"
                            }`}
                          >
                            {faq.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                          <button
                            onClick={() => handleEdit(faq)}
                            className="w-11 h-11 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-xl shadow-sm border border-slate-100 dark:border-white/5 transition-all active:scale-90"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(faq)}
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

        <div className="p-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900 dark:text-white">{filtered.length}</span> of <span className="text-slate-900 dark:text-white">{faqs.length}</span> FAQs
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
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">{isEditMode ? "Edit FAQ" : "New FAQ"}</h3>
                  <p className="text-sm text-slate-500 font-medium">Add a frequently asked question.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-rose-500 transition-colors shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Question</label>
                  <input name="question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="How do I book a property?" className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Answer</label>
                  <textarea name="answer" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={5} placeholder="Write the answer..." className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Display Order</label>
                    <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })} className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
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
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-[20px] font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Cancel</button>
                <button onClick={handleSubmit} className="flex-1 py-4 bg-indigo-600 text-white rounded-[20px] font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  {isEditMode ? "Save Changes" : "Create FAQ"}
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
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Delete FAQ?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8">
                Delete FAQ <span className="text-slate-900 dark:text-white font-bold">"{deleteConfig.question}"</span>? This cannot be undone.
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
