"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Image as ImageIcon,
  Tag,
  Globe2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Eye,
  Sparkles,
  Star,
  BookOpen,
  Clock,
  Layers,
  Search,
} from "lucide-react";

const SAMPLE_COVERS = [
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=60",
];

const SUGGESTED_CATEGORIES = [
  "Market Insights",
  "Buying Guide",
  "Rental Tips",
  "Legal & RERA",
  "Home Decor",
  "Investment Strategy",
  "Commercial Real Estate",
  "Smart Cities",
];

const FORM_TABS = [
  { id: "content", label: "Article Content", icon: FileText },
  { id: "taxonomy", label: "Categories & Tags", icon: Tag },
  { id: "seo", label: "SEO & Social Preview", icon: Globe2 },
  { id: "publish", label: "Publish Settings", icon: Calendar },
];

export default function BlogModal({
  isOpen,
  onClose,
  editingBlog = null,
  onSubmit,
}) {
  const isEditMode = Boolean(editingBlog);
  const [activeTab, setActiveTab] = useState("content");

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    categories: [],
    tags: [],
    status: "draft",
    featured: false,
    publishDate: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
  });

  const [newTagInput, setNewTagInput] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingBlog) {
        setFormData({
          title: editingBlog.title || "",
          excerpt: editingBlog.excerpt || "",
          content: editingBlog.content || "",
          coverImage: editingBlog.coverImage || "",
          categories: Array.isArray(editingBlog.categories) ? editingBlog.categories : [],
          tags: Array.isArray(editingBlog.tags) ? editingBlog.tags : [],
          status: editingBlog.status || "draft",
          featured: editingBlog.featured ?? false,
          publishDate: editingBlog.publishDate
            ? new Date(editingBlog.publishDate).toISOString().split("T")[0]
            : "",
          metaTitle: editingBlog.metaTitle || "",
          metaDescription: editingBlog.metaDescription || "",
          metaKeywords: editingBlog.metaKeywords || "",
        });
      } else {
        setFormData({
          title: "",
          excerpt: "",
          content: "",
          coverImage: SAMPLE_COVERS[0],
          categories: ["Market Insights"],
          tags: ["RealEstate", "Property"],
          status: "draft",
          featured: false,
          publishDate: new Date().toISOString().split("T")[0],
          metaTitle: "",
          metaDescription: "",
          metaKeywords: "",
        });
      }
      setActiveTab("content");
      setNewTagInput("");
      setErrors({});
      setTouched({});
      setServerError("");
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen, editingBlog]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Slug generator
  const generatedSlug = useMemo(() => {
    return (formData.title || "")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }, [formData.title]);

  // Calculated stats
  const wordCount = useMemo(() => {
    if (!formData.content) return 0;
    return formData.content.trim().split(/\s+/).filter(Boolean).length;
  }, [formData.content]);

  const readingTime = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  const validateField = (field, value) => {
    let error = "";
    if (field === "title") {
      if (!value.trim()) {
        error = "Blog title is required.";
      } else if (value.trim().length < 5) {
        error = "Title must be at least 5 characters.";
      }
    }
    if (field === "content") {
      if (!value.trim()) {
        error = "Article content cannot be empty.";
      } else if (value.trim().length < 20) {
        error = "Content should be at least 20 characters.";
      }
    }
    return error;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setServerError("");
    if (touched[field] || field === "title" || field === "content") {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const cleaned = newTagInput.trim().replace(/^#/, "");
      if (cleaned && !formData.tags.includes(cleaned)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, cleaned] }));
      }
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const toggleCategory = (cat) => {
    setFormData((prev) => {
      const exists = prev.categories.includes(cat);
      if (exists) {
        return { ...prev, categories: prev.categories.filter((c) => c !== cat) };
      } else {
        return { ...prev, categories: [...prev.categories, cat] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const titleError = validateField("title", formData.title);
    const contentError = validateField("content", formData.content);

    setTouched({ title: true, content: true });
    setErrors({ title: titleError, content: contentError });

    if (titleError || contentError) {
      setActiveTab("content");
      return;
    }

    setIsSubmitting(true);
    setServerError("");

    try {
      const payload = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        coverImage: formData.coverImage.trim() || undefined,
        categories: formData.categories,
        tags: formData.tags,
        status: formData.status,
        featured: formData.featured,
        publishDate: formData.publishDate ? new Date(formData.publishDate) : undefined,
        metaTitle: formData.metaTitle.trim() || undefined,
        metaDescription: formData.metaDescription.trim() || undefined,
        metaKeywords: formData.metaKeywords.trim() || undefined,
      };

      await onSubmit(payload);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to save blog post. Please verify fields and try again.";
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="blog-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isSubmitting ? onClose : undefined}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[28px] md:rounded-[36px] shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden flex flex-col my-auto z-10 max-h-[92vh]"
          >
            {/* Header */}
            <div className="px-6 py-5 md:px-8 md:py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-sm shrink-0">
                  <FileText size={22} />
                </div>
                <div>
                  <h3
                    id="blog-modal-title"
                    className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight"
                  >
                    {isEditMode ? "Edit Blog Article" : "Write New Blog Article"}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                    Draft, organize taxonomy, optimize SEO, and publish property articles.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 md:px-8 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-white/5 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
              {FORM_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                      isActive
                        ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white/60 dark:bg-white/5"
                        : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon size={15} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Success Overlay */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-500/20 animate-bounce">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    {isEditMode ? "Article Updated Successfully!" : "Article Created Successfully!"}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                    "{formData.title}" has been saved and its publication settings updated.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar flex-1">
              {/* Server Alert Banner */}
              {serverError && (
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs md:text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* TAB 1: Article Content */}
              {activeTab === "content" && (
                <div className="space-y-5 animate-fade-in">
                  {/* Title & Slug */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Article Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      onBlur={() => handleBlur("title")}
                      placeholder="e.g. 10 Essential Things to Check Before Buying an Apartment in 2026"
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-base font-bold text-slate-900 dark:text-white placeholder:text-slate-400 border outline-none transition-all ${
                        errors.title && touched.title
                          ? "border-rose-400 dark:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                          : "border-slate-200 dark:border-white/10 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                      }`}
                    />
                    {errors.title && touched.title && (
                      <p className="text-xs text-rose-500 font-medium flex items-center gap-1 pl-1">
                        <AlertCircle size={12} /> {errors.title}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 font-mono pl-1">
                      Live Slug: <span className="text-indigo-600 dark:text-indigo-400">/blog/{generatedSlug || "your-slug"}</span>
                    </p>
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Short Summary / Excerpt
                    </label>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => handleChange("excerpt", e.target.value)}
                      rows={2}
                      placeholder="A short compelling overview displayed on blog cards and search results..."
                      disabled={isSubmitting}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Cover Image URL & Sample Picker */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/60 dark:border-white/5 space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-indigo-600 dark:text-indigo-400" />
                      Featured Cover Image
                    </label>

                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Image Preview Thumbnail */}
                      <div className="w-full sm:w-44 h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 overflow-hidden relative shrink-0 shadow-inner flex items-center justify-center">
                        {formData.coverImage ? (
                          <img
                            src={formData.coverImage}
                            alt="Cover Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = SAMPLE_COVERS[0];
                            }}
                          />
                        ) : (
                          <div className="text-center text-slate-400">
                            <ImageIcon size={24} className="mx-auto mb-1 opacity-50" />
                            <span className="text-[10px] uppercase font-bold">No Image</span>
                          </div>
                        )}
                      </div>

                      {/* URL input and samples */}
                      <div className="flex-1 space-y-2.5">
                        <input
                          type="url"
                          name="coverImage"
                          value={formData.coverImage}
                          onChange={(e) => handleChange("coverImage", e.target.value)}
                          placeholder="Paste image URL (https://...)"
                          disabled={isSubmitting}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none"
                        />
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            Or Select a Real Estate Sample Cover:
                          </span>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {SAMPLE_COVERS.map((img, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleChange("coverImage", img)}
                                className={`w-12 h-10 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                                  formData.coverImage === img
                                    ? "border-indigo-600 scale-105 shadow-md"
                                    : "border-transparent opacity-60 hover:opacity-100"
                                }`}
                              >
                                <img src={img} alt="sample" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Editor */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Article Body Content <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                        <span>{wordCount} words</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
                          <Clock size={12} /> ~{readingTime} min read
                        </span>
                      </div>
                    </div>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={(e) => handleChange("content", e.target.value)}
                      onBlur={() => handleBlur("content")}
                      rows={10}
                      placeholder="Write your article content here in Markdown or plain text..."
                      disabled={isSubmitting}
                      className={`w-full p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-sm font-mono text-slate-900 dark:text-white placeholder:text-slate-400 border outline-none transition-all resize-y ${
                        errors.content && touched.content
                          ? "border-rose-400 dark:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                          : "border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      }`}
                    />
                    {errors.content && touched.content && (
                      <p className="text-xs text-rose-500 font-medium flex items-center gap-1 pl-1">
                        <AlertCircle size={12} /> {errors.content}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: Categories & Tags */}
              {activeTab === "taxonomy" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Category Selection */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Article Classifications
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Select one or more categories that best match your post topics.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_CATEGORIES.map((cat) => {
                        const isSelected = formData.categories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleCategory(cat)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                                : "bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                            }`}
                          >
                            <span>{isSelected ? "✓" : "+"}</span>
                            <span>{cat}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tags Manager */}
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Search Hashtags / Keywords
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10px]">Enter</kbd> or comma to add a tag.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-wrap items-center gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 rounded-lg text-xs font-bold shadow-sm border border-slate-200/60 dark:border-white/5"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-rose-500 transition-colors ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}

                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder={formData.tags.length === 0 ? "Type tag & press enter..." : "Add more..."}
                        className="bg-transparent border-none outline-none text-xs font-bold text-slate-800 dark:text-white placeholder:text-slate-400 flex-1 min-w-[140px] py-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SEO & Social Preview */}
              {activeTab === "seo" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Google SERP Snippet Preview */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/5 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Eye size={12} /> Google Search Preview
                    </span>
                    <div>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono truncate block">
                        https://rentzypro.com/blog/{generatedSlug || "your-post"}
                      </span>
                      <h4 className="text-base font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                        {formData.metaTitle || formData.title || "Your Blog Post Title"}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {formData.metaDescription || formData.excerpt || "Your blog post description will appear here in search engine results snippets."}
                      </p>
                    </div>
                  </div>

                  {/* Meta Title */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Meta Title
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formData.metaTitle.length}/60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={(e) => handleChange("metaTitle", e.target.value)}
                      placeholder={formData.title || "Custom SEO Title"}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-sm font-medium text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  {/* Meta Description */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Meta Description
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formData.metaDescription.length}/160 chars
                      </span>
                    </div>
                    <textarea
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={(e) => handleChange("metaDescription", e.target.value)}
                      rows={2}
                      placeholder={formData.excerpt || "Custom search engine snippet description..."}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-sm font-medium text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none resize-none"
                    />
                  </div>

                  {/* Keywords */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      SEO Meta Keywords
                    </label>
                    <input
                      type="text"
                      name="metaKeywords"
                      value={formData.metaKeywords}
                      onChange={(e) => handleChange("metaKeywords", e.target.value)}
                      placeholder="e.g. real estate tips, flat for rent, buy house india"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-sm font-medium text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: Publish Settings */}
              {activeTab === "publish" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Status Selection Cards */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Publication Status
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          id: "draft",
                          label: "Draft",
                          desc: "Visible only to administrators",
                          color: "slate",
                        },
                        {
                          id: "published",
                          label: "Published",
                          desc: "Live & visible to all visitors",
                          color: "emerald",
                        },
                        {
                          id: "archived",
                          label: "Archived",
                          desc: "Hidden from live feed",
                          color: "amber",
                        },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => handleChange("status", st.id)}
                          className={`p-4 rounded-2xl text-left border transition-all ${
                            formData.status === st.id
                              ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-600 dark:border-indigo-400 shadow-sm ring-1 ring-indigo-500/20"
                              : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/80 dark:border-white/5 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {st.label}
                            </span>
                            {formData.status === st.id && (
                              <CheckCircle2 size={16} className="text-indigo-600 dark:text-indigo-400" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                            {st.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Publish Date */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Scheduled / Published Date
                    </label>
                    <input
                      type="date"
                      name="publishDate"
                      value={formData.publishDate}
                      onChange={(e) => handleChange("publishDate", e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-sm font-bold text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  {/* Featured Article Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <Star size={20} className={formData.featured ? "fill-amber-500" : ""} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          Pin as Featured Article
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Highlight this article on top hero carousels and newsletter spotlights.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleChange("featured", !formData.featured)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formData.featured ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          formData.featured ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-3 shrink-0">
                <div className="text-xs text-slate-400 font-medium hidden sm:block">
                  {formData.status === "published" ? "🟢 Will be publicly visible" : "🟡 Saved as private draft"}
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-5 py-3 rounded-2xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-2xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>{isEditMode ? "Saving Post..." : "Publishing Post..."}</span>
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        <span>{isEditMode ? "Save Changes" : "Create Article"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
