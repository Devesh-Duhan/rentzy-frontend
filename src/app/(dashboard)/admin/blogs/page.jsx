"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  FileText,
  Search,
  ExternalLink,
  RefreshCcw,
  Star,
  Eye,
  Clock,
  Calendar,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import axios from "@/lib/axios";
import { DeleteConfirmationModal, BlogModal } from "../_components/AdminComponents";
import toast from "react-hot-toast";

const STATUS_TABS = ["All", "published", "draft", "archived", "featured"];
const ITEMS_PER_PAGE = 8;

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ id: null, name: "" });

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get("/admin/blogs");
      setBlogs(Array.isArray(data) ? data : data.blogs || data.data || []);
    } catch {
      toast.error("Failed to load blog articles.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openAddModal = () => {
    setEditingBlog(null);
    setIsModalOpen(true);
  };

  const openEditModal = (blog) => {
    setEditingBlog(blog);
    setIsModalOpen(true);
  };

  const handleDelete = (blog) => {
    setDeleteConfig({ id: blog._id, name: blog.title });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    const loadingToast = toast.loading("Removing blog article...");
    try {
      await axios.delete(`/admin/blogs/${deleteConfig.id}`);
      toast.success("Blog article deleted successfully!", { id: loadingToast });
      fetchBlogs();
    } catch {
      toast.error("Failed to delete blog article.", { id: loadingToast });
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleBlogSubmit = async (payload) => {
    if (editingBlog) {
      await axios.put(`/admin/blogs/${editingBlog._id}`, payload);
      toast.success("Article updated successfully!");
    } else {
      await axios.post("/admin/blogs", payload);
      toast.success("Article published successfully!");
    }
    fetchBlogs();
  };

  // Extract unique categories across all blogs
  const allCategories = useMemo(() => {
    const set = new Set();
    blogs.forEach((b) => {
      if (Array.isArray(b.categories)) {
        b.categories.forEach((c) => set.add(c));
      }
    });
    return ["All", ...Array.from(set)];
  }, [blogs]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter((b) => b.status === "published").length;
    const drafts = blogs.filter((b) => b.status === "draft").length;
    const totalViews = blogs.reduce((acc, curr) => acc + (curr.views || 0), 0);
    return { total, published, drafts, totalViews };
  }, [blogs]);

  // Filtered Blogs
  const filtered = useMemo(() => {
    return blogs.filter((b) => {
      const q = search.toLowerCase();
      const matchesSearch =
        b.title?.toLowerCase().includes(q) ||
        b.excerpt?.toLowerCase().includes(q) ||
        (Array.isArray(b.categories) && b.categories.some((c) => c.toLowerCase().includes(q))) ||
        (Array.isArray(b.tags) && b.tags.some((t) => t.toLowerCase().includes(q))) ||
        b.author?.name?.toLowerCase().includes(q);

      let matchesTab = true;
      if (activeTab === "featured") {
        matchesTab = Boolean(b.featured);
      } else if (activeTab !== "All") {
        matchesTab = b.status === activeTab;
      }

      const matchesCat =
        selectedCategory === "All" ||
        (Array.isArray(b.categories) && b.categories.includes(selectedCategory));

      return matchesSearch && matchesTab && matchesCat;
    });
  }, [blogs, search, activeTab, selectedCategory]);

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab, selectedCategory]);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Blog & Content Hub
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold mt-1">
            Publish real estate market trends, tenant advice, and investment articles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBlogs}
            className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm transition-all active:scale-95"
            title="Refresh articles"
          >
            <RefreshCcw size={18} />
          </button>
          <button
            onClick={openAddModal}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-200 dark:shadow-none transition-all"
          >
            <Plus size={18} /> Add New Blog
          </button>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Articles",
            value: stats.total,
            icon: BookOpen,
            color: "indigo",
          },
          {
            label: "Published Live",
            value: stats.published,
            icon: CheckCircle2,
            color: "emerald",
          },
          {
            label: "Drafts in Progress",
            value: stats.drafts,
            icon: FileText,
            color: "amber",
          },
          {
            label: "Total Reader Views",
            value: stats.totalViews.toLocaleString(),
            icon: Eye,
            color: "purple",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="p-5 bg-white dark:bg-slate-900/50 rounded-[28px] border border-slate-100 dark:border-white/10 shadow-sm flex items-center gap-4"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-${item.color}-600 dark:text-${item.color}-400 bg-${item.color}-50 dark:bg-${item.color}-500/10 border border-${item.color}-100 dark:border-${item.color}-500/20 shrink-0`}
              >
                <Icon size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {item.label}
                </p>
                <h4 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  {item.value}
                </h4>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters & Search Control Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 md:p-6 bg-white dark:bg-slate-900/50 rounded-[28px] border border-slate-100 dark:border-white/10 shadow-sm backdrop-blur-3xl">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 custom-scrollbar">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                  : "bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
              }`}
            >
              {tab === "featured" && <Star size={13} className="fill-current" />}
              <span>{tab === "All" ? "All Articles" : tab}</span>
            </button>
          ))}
        </div>

        {/* Category & Search inputs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-1 lg:max-w-xl justify-end">
          {/* Category Dropdown */}
          <div className="relative w-full sm:w-48 shrink-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-3.5 pr-8 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl text-xs font-bold text-slate-700 dark:text-white outline-none cursor-pointer appearance-none"
            >
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative w-full">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, tags, or author..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl text-xs font-bold text-slate-700 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Articles Table Container */}
      <div className="bg-white dark:bg-slate-800/40 rounded-[32px] md:rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
              Loading Blog Catalog...
            </p>
          </div>
        ) : paginatedBlogs.length === 0 ? (
          <div className="p-16 text-center max-w-sm mx-auto">
            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-4">
              <FileText size={36} />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              No blog articles found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              {search || activeTab !== "All" || selectedCategory !== "All"
                ? "No articles match your filtered search criteria."
                : "Create and publish your first real estate article."}
            </p>
            {!search && activeTab === "All" && selectedCategory === "All" && (
              <button
                onClick={openAddModal}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md"
              >
                Write First Blog
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <th className="text-left px-8 py-5">Article & Summary</th>
                  <th className="text-left px-6 py-5">Status</th>
                  <th className="text-left px-6 py-5">Categories</th>
                  <th className="text-left px-6 py-5">Author</th>
                  <th className="text-left px-6 py-5">Views</th>
                  <th className="text-left px-6 py-5">Published Date</th>
                  <th className="text-right px-8 py-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {paginatedBlogs.map((blog, idx) => (
                  <motion.tr
                    key={blog._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-slate-50/80 dark:hover:bg-white/2 transition-colors group"
                  >
                    {/* Article & Thumbnail */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4 min-w-[280px] max-w-[360px]">
                        <div className="w-16 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 overflow-hidden shrink-0 relative shadow-sm">
                          {blog.coverImage ? (
                            <img
                              src={blog.coverImage}
                              alt={blog.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <FileText size={16} />
                            </div>
                          )}
                          {blog.featured && (
                            <div className="absolute top-1 right-1 p-0.5 rounded-md bg-amber-500 text-white shadow-sm">
                              <Star size={10} className="fill-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {blog.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mt-0.5">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock size={11} /> {blog.readingTime || 3} min
                            </span>
                            <span>•</span>
                            <span className="truncate font-mono">/blog/{blog.slug || "slug"}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                          blog.status === "published"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20"
                            : blog.status === "archived"
                            ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20"
                            : "bg-slate-100 text-slate-500 dark:bg-white/5 border border-slate-200/60 dark:border-white/5"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            blog.status === "published"
                              ? "bg-emerald-500 animate-pulse"
                              : blog.status === "archived"
                              ? "bg-amber-500"
                              : "bg-slate-400"
                          }`}
                        />
                        <span className="capitalize">{blog.status}</span>
                      </span>
                    </td>

                    {/* Categories */}
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {Array.isArray(blog.categories) && blog.categories.length > 0 ? (
                          blog.categories.slice(0, 2).map((cat) => (
                            <span
                              key={cat}
                              className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold border border-indigo-100 dark:border-indigo-500/20"
                            >
                              {cat}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                        {Array.isArray(blog.categories) && blog.categories.length > 2 && (
                          <span className="text-[10px] text-slate-400 font-bold self-center">
                            +{blog.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Author */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                          {(blog.author?.name || "A").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                          {blog.author?.name || "Admin"}
                        </span>
                      </div>
                    </td>

                    {/* Views */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <Eye size={13} className="text-slate-400" />
                        <span>{(blog.views || 0).toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Published Date */}
                    <td className="px-6 py-5">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {blog.publishDate
                          ? new Date(blog.publishDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : blog.createdAt
                          ? new Date(blog.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        {blog.slug && (
                          <a
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-xl border border-slate-200/60 dark:border-white/5 transition-all active:scale-90 shadow-sm"
                            title="Preview live blog"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button
                          onClick={() => openEditModal(blog)}
                          className="w-9 h-9 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl border border-slate-200/60 dark:border-white/5 transition-all active:scale-90 shadow-sm"
                          title="Edit Article"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(blog)}
                          className="w-9 h-9 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl border border-slate-200/60 dark:border-white/5 transition-all active:scale-90 shadow-sm"
                          title="Delete Article"
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

        {/* Pagination Bar */}
        {filtered.length > ITEMS_PER_PAGE && (
          <div className="p-4 md:p-6 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-white/[0.02]">
            <span className="text-xs font-bold text-slate-400">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} articles
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-500 transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      currentPage === page
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-500 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Blog Creation & Edit Modal */}
      <BlogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingBlog={editingBlog}
        onSubmit={handleBlogSubmit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={deleteConfig.name}
        type="Blog Article"
      />
    </div>
  );
}
