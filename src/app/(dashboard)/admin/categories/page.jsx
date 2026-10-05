"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit2, Trash2, Tag, Search, RefreshCcw, Layers, CheckCircle2, XCircle
} from "lucide-react";
import axios from "@/lib/axios";
import { DeleteConfirmationModal, CategoryModal } from "../_components/AdminComponents";
import toast from "react-hot-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ id: null, name: "" });

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get("/admin/categories");
      setCategories(Array.isArray(data) ? data : data.categories || data.data || []);
    } catch {
      toast.error("Failed to load categories catalog.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleDelete = (cat) => {
    setDeleteConfig({ id: cat._id, name: cat.name });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    const loadingToast = toast.loading("Removing category...");
    try {
      await axios.delete(`/admin/categories/${deleteConfig.id}`);
      toast.success("Category deleted successfully!", { id: loadingToast });
      fetchCategories();
    } catch {
      toast.error("Failed to delete category.", { id: loadingToast });
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleCategorySubmit = async (payload) => {
    if (editingCategory) {
      await axios.put(`/admin/categories/${editingCategory._id}`, payload);
      toast.success("Category updated successfully!");
    } else {
      await axios.post("/admin/categories", payload);
      toast.success("Category created successfully!");
    }
    fetchCategories();
  };

  const filtered = categories.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Property Categories
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold mt-1">
            Organize and classify property listings for public exploration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
            className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm transition-all active:scale-95"
            title="Refresh categories"
          >
            <RefreshCcw size={18} />
          </button>
          <button
            onClick={openAddModal}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-200 dark:shadow-none transition-all"
          >
            <Plus size={18} /> Add Category
          </button>
        </div>
      </div>

      {/* Search & Statistics Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-6 bg-white dark:bg-slate-900/50 rounded-[28px] border border-slate-100 dark:border-white/10 shadow-sm backdrop-blur-3xl">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name or description..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl md:rounded-2xl text-sm font-bold text-slate-700 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
          <span>{filtered.length} Total Categories</span>
        </div>
      </div>

      {/* Categories Table Container */}
      <div className="bg-white dark:bg-slate-800/40 rounded-[32px] md:rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
              Loading Categories...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center max-w-sm mx-auto">
            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-4">
              <Tag size={36} />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              No categories found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              {search ? "No categories match your search criteria." : "Create your first category to organize property listings."}
            </p>
            {!search && (
              <button
                onClick={openAddModal}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
              >
                Create Category
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <th className="text-left px-8 py-5">Classification</th>
                  <th className="text-left px-6 py-5">Slug / URL Path</th>
                  <th className="text-left px-6 py-5">Description</th>
                  <th className="text-left px-6 py-5">Order</th>
                  <th className="text-left px-6 py-5">Parent</th>
                  <th className="text-left px-6 py-5">Status</th>
                  <th className="text-right px-8 py-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {filtered.map((cat, idx) => (
                  <motion.tr
                    key={cat._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-slate-50/80 dark:hover:bg-white/2 transition-colors group"
                  >
                    {/* Classification */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-2xl shadow-sm shrink-0">
                          {cat.icon || "🏠"}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">
                            {cat.name}
                          </div>
                          {cat.propertyCount !== undefined && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              {cat.propertyCount} properties
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-6 py-5">
                      <code className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono bg-indigo-50/60 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                        /{cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-')}
                      </code>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-5">
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[220px] truncate">
                        {cat.description || "—"}
                      </p>
                    </td>

                    {/* Display Order */}
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        #{cat.displayOrder ?? 0}
                      </span>
                    </td>

                    {/* Parent */}
                    <td className="px-6 py-5">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {typeof cat.parent === "object" && cat.parent ? cat.parent.name : "—"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                          (cat.isActive ?? cat.active)
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20"
                            : "bg-slate-100 text-slate-400 dark:bg-white/5 border border-slate-200/60 dark:border-white/5"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${(cat.isActive ?? cat.active) ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                        {(cat.isActive ?? cat.active) ? "Active" : "Hidden"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="w-9 h-9 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl border border-slate-200/60 dark:border-white/5 transition-all active:scale-90 shadow-sm"
                          title="Edit Category"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="w-9 h-9 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl border border-slate-200/60 dark:border-white/5 transition-all active:scale-90 shadow-sm"
                          title="Delete Category"
                        >
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

      {/* Category Modal (Add / Edit) */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        editingCategory={editingCategory}
        onSubmit={handleCategorySubmit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={deleteConfig.name}
        type="Category"
      />
    </div>
  );
}

