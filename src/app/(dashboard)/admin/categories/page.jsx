"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus, Edit2, Trash2, Hash, Tag, X, Search
} from "lucide-react";
import axios from "@/lib/axios";
import { Toast, DeleteConfirmationModal } from "../_components/AdminComponents";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ id: null, name: "" });
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [form, setForm] = useState({
    name: "", icon: "", description: "", parent: "", displayOrder: 0, active: true
  });

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get("/admin/categories");
      setCategories(data.categories || data);
    } catch {
      showNotification("Failed to load categories", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAddModal = () => {
    setForm({ name: "", icon: "", description: "", parent: "", displayOrder: 0, active: true });
    setIsEditMode(false);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setForm({
      name: cat.name || "",
      icon: cat.icon || "",
      description: cat.description || "",
      parent: cat.parent?._id || cat.parent || "",
      displayOrder: cat.displayOrder ?? 0,
      active: cat.active ?? true
    });
    setIsEditMode(true);
    setEditingId(cat._id);
    setIsModalOpen(true);
  };

  const handleDelete = (cat) => {
    setDeleteConfig({ id: cat._id, name: cat.name });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/admin/categories/${deleteConfig.id}`);
      showNotification("Category deleted!", "info");
      fetchCategories();
    } catch {
      showNotification("Delete failed!", "error");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditMode) {
        await axios.put(`/admin/categories/${editingId}`, form);
        showNotification("Category updated!");
      } else {
        await axios.post("/admin/categories", form);
        showNotification("Category created!");
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch {
      showNotification(isEditMode ? "Update failed!" : "Create failed!", "error");
    }
  };

  const filtered = categories.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Categories</h2>
          <p className="text-sm text-slate-500 font-medium">Manage property categories</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-100 transition-all w-full sm:w-64"
            />
          </div>
          <button onClick={openAddModal} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg text-sm">
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800/40 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-400 mt-4">Loading categories...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Tag size={40} className="text-slate-300 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-400">No categories found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Icon</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Order</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Parent</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="text-right p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cat) => (
                  <motion.tr
                    key={cat._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 font-bold text-slate-900 dark:text-white text-sm">{cat.name}</td>
                    <td className="p-4 text-2xl">{cat.icon}</td>
                    <td className="p-4 text-sm text-slate-500 max-w-[200px] truncate">{cat.description}</td>
                    <td className="p-4 text-sm text-slate-500">{cat.displayOrder}</td>
                    <td className="p-4 text-sm text-slate-500">
                      {typeof cat.parent === "object" && cat.parent ? cat.parent.name : cat.parent || "—"}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${cat.active ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : "bg-slate-100 text-slate-400 dark:bg-white/5"}`}>
                        {cat.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(cat)} className="p-2 bg-slate-50 dark:bg-white/5 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(cat)} className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[80]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 bottom-8 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2 w-[calc(100%-32px)] md:max-w-lg bg-white dark:bg-slate-900 z-[90] rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-slate-100 dark:border-white/10"
          >
            <div className="p-6 md:p-8 border-b border-slate-50 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{isEditMode ? "Edit Category" : "Add Category"}</h3>
                <p className="text-xs text-slate-500 font-medium">{isEditMode ? "Update category details." : "Create a new property category."}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-rose-500 transition-colors shadow-sm">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 md:p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Apartment" className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Icon (emoji)</label>
                <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="e.g. 🏠" maxLength={2} className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Brief description..." className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Parent Category</label>
                  <select value={form.parent} onChange={e => setForm({ ...form, parent: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-100 transition-all appearance-none">
                    <option value="">None (Top Level)</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Display Order</label>
                  <input value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: Number(e.target.value) })} type="number" className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active</label>
                <button onClick={() => setForm({ ...form, active: !form.active })} className={`w-12 h-6 rounded-full transition-colors ${form.active ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${form.active ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
            <div className="p-6 md:p-8 border-t border-slate-50 dark:border-white/5 flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-[20px] font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Discard</button>
              <button onClick={handleSubmit} className="flex-1 py-4 bg-indigo-600 text-white rounded-[20px] font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                {isEditMode ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </motion.div>
        </>
      )}

      <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} itemName={deleteConfig.name} type="Category" />
      <Toast toast={toast} />
    </div>
  );
}
