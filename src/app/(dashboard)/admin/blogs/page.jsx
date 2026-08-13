"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus, Edit2, Trash2, FileText, X, Search, ExternalLink
} from "lucide-react";
import axios from "@/lib/axios";
import { Toast, DeleteConfirmationModal } from "../_components/AdminComponents";

const STATUS_TABS = ["All", "draft", "published", "archived"];

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ id: null, name: "" });
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [form, setForm] = useState({
    title: "", content: "", excerpt: "", coverImage: "", categories: "", tags: "", status: "draft", featured: false
  });

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get("/admin/blogs");
      setBlogs(data.blogs || data);
    } catch {
      showNotification("Failed to load blogs", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const openAddModal = () => {
    setForm({ title: "", content: "", excerpt: "", coverImage: "", categories: "", tags: "", status: "draft", featured: false });
    setIsEditMode(false);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (blog) => {
    setForm({
      title: blog.title || "",
      content: blog.content || "",
      excerpt: blog.excerpt || "",
      coverImage: blog.coverImage || "",
      categories: Array.isArray(blog.categories) ? blog.categories.join(", ") : (blog.categories || ""),
      tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : (blog.tags || ""),
      status: blog.status || "draft",
      featured: blog.featured ?? false
    });
    setIsEditMode(true);
    setEditingId(blog._id);
    setIsModalOpen(true);
  };

  const handleDelete = (blog) => {
    setDeleteConfig({ id: blog._id, name: blog.title });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/admin/blogs/${deleteConfig.id}`);
      showNotification("Blog deleted!", "info");
      fetchBlogs();
    } catch {
      showNotification("Delete failed!", "error");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        categories: form.categories.split(",").map(s => s.trim()).filter(Boolean),
        tags: form.tags.split(",").map(s => s.trim()).filter(Boolean)
      };
      if (isEditMode) {
        await axios.put(`/admin/blogs/${editingId}`, payload);
        showNotification("Blog updated!");
      } else {
        await axios.post("/admin/blogs", payload);
        showNotification("Blog created!");
      }
      setIsModalOpen(false);
      fetchBlogs();
    } catch {
      showNotification(isEditMode ? "Update failed!" : "Create failed!", "error");
    }
  };

  const statusStyles = {
    draft: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300",
    published: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10",
    archived: "bg-orange-50 text-orange-600 dark:bg-orange-500/10"
  };

  const filtered = blogs.filter(b => {
    const matchesSearch = b.title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = activeTab === "All" || b.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Blogs</h2>
          <p className="text-sm text-slate-500 font-medium">Manage blog articles & posts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search blogs..."
              className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-100 transition-all w-full sm:w-64"
            />
          </div>
          <button onClick={openAddModal} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg text-sm">
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab ? "bg-indigo-600 text-white shadow-lg" : "bg-white dark:bg-slate-800/40 text-slate-400 border border-slate-100 dark:border-white/5 hover:border-indigo-200"}`}
          >
            {tab === "All" ? "All Status" : tab}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800/40 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-400 mt-4">Loading blogs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={40} className="text-slate-300 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-400">No blogs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Title</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Author</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Categories</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Views</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Publish Date</th>
                  <th className="text-right p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((blog) => (
                  <motion.tr
                    key={blog._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 font-bold text-slate-900 dark:text-white text-sm max-w-[240px] truncate">{blog.title}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${statusStyles[blog.status] || statusStyles.draft}`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500">{blog.author?.name || blog.author || "—"}</td>
                    <td className="p-4 text-sm text-slate-500 max-w-[150px] truncate">
                      {Array.isArray(blog.categories) ? blog.categories.join(", ") : blog.categories || "—"}
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-700 dark:text-slate-300">{blog.views ?? 0}</td>
                    <td className="p-4 text-sm text-slate-500">
                      {blog.publishDate ? new Date(blog.publishDate).toLocaleDateString() : blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {blog.slug && (
                          <a
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-slate-50 dark:bg-white/5 text-slate-500 rounded-xl hover:bg-sky-50 hover:text-sky-600 transition-all"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button onClick={() => openEditModal(blog)} className="p-2 bg-slate-50 dark:bg-white/5 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(blog)} className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all">
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
            className="fixed inset-x-4 bottom-8 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2 w-[calc(100%-32px)] md:max-w-2xl bg-white dark:bg-slate-900 z-[90] rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-slate-100 dark:border-white/10 max-h-[95vh]"
          >
            <div className="p-6 md:p-8 border-b border-slate-50 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{isEditMode ? "Edit Blog" : "Add Blog"}</h3>
                <p className="text-xs text-slate-500 font-medium">{isEditMode ? "Update blog post." : "Create a new blog article."}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-rose-500 transition-colors shadow-sm">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-6 md:p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Title</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Blog post title" className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Content</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={8} placeholder="Write your blog content here..." className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Excerpt</label>
                  <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={3} placeholder="Brief summary..." className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cover Image URL</label>
                  <input value={form.coverImage} onChange={e => setForm({ ...form, coverImage: e.target.value })} placeholder="https://..." className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categories (comma separated)</label>
                  <input value={form.categories} onChange={e => setForm({ ...form, categories: e.target.value })} placeholder="Real Estate, Market" className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tags (comma separated)</label>
                  <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="rent, buying, guide" className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-100 transition-all appearance-none">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="space-y-2 flex items-end pb-4">
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Featured</label>
                    <button onClick={() => setForm({ ...form, featured: !form.featured })} className={`w-12 h-6 rounded-full transition-colors ${form.featured ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${form.featured ? "translate-x-6" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8 border-t border-slate-50 dark:border-white/5 flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-[20px] font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Discard</button>
              <button onClick={handleSubmit} className="flex-1 py-4 bg-indigo-600 text-white rounded-[20px] font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                {isEditMode ? "Save Changes" : "Create Blog"}
              </button>
            </div>
          </motion.div>
        </>
      )}

      <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} itemName={deleteConfig.name} type="Blog" />
      <Toast toast={toast} />
    </div>
  );
}
