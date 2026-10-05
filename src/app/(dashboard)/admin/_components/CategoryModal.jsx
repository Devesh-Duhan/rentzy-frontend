"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Tag,
  Smile,
  Layers,
  FileText,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Sparkles,
  Eye,
  Globe2,
  ChevronDown,
  Search,
} from "lucide-react";

const CATEGORY_TEMPLATES = [
  {
    name: "Residential Apartments",
    icon: "🏢",
    description: "Multi-family residential flats, studios, and high-rise apartments.",
  },
  {
    name: "Independent Villas",
    icon: "🏡",
    description: "Standalone luxury villas, bungalows, and private row houses.",
  },
  {
    name: "Commercial Offices",
    icon: "🏬",
    description: "Corporate office floors, co-working suites, and tech park workspaces.",
  },
  {
    name: "Retail Shops & Showrooms",
    icon: "🛍️",
    description: "Street-level retail stores, market outlets, and commercial showrooms.",
  },
  {
    name: "Plots & Land",
    icon: "🌾",
    description: "Approved residential plots, agricultural land, and industrial estates.",
  },
  {
    name: "PG & Student Hostels",
    icon: "🤝",
    description: "Furnished student hostels, paying guest rooms, and shared coliving.",
  },
  {
    name: "Warehouses & Logistics",
    icon: "🏭",
    description: "Industrial godowns, storage facilities, and logistics distribution hubs.",
  },
  {
    name: "Vacation & Short-Term Stays",
    icon: "🏖️",
    description: "Holiday homes, serviced apartments, and short-term stay villas.",
  },
];

const EMOJI_CATEGORIES = {
  Homes: ["🏠", "🏡", "🏢", "🏘️", "🏰", "🛖", "🛋️", "🚪"],
  Commercial: ["🏬", "🏪", "💼", "🛍️", "🏢", "🏙️", "🏨", "🏦"],
  Industrial: ["🏭", "🏗️", "📦", "⚙️", "🚢", "🚛", "⚡", "🔧"],
  Land: ["🌾", "🌳", "📐", "🏞️", "🏖️", "⛳", "🌴", "🌄"],
  Special: ["✨", "🔑", "⭐", "💎", "🎯", "🛡️", "🔥", "🚀"],
};

export default function CategoryModal({
  isOpen,
  onClose,
  categories = [],
  editingCategory = null,
  onSubmit,
}) {
  const isEditMode = Boolean(editingCategory);

  const [formData, setFormData] = useState({
    name: "",
    icon: "🏠",
    description: "",
    parent: "",
    displayOrder: 1,
    isActive: true,
    metaTitle: "",
    metaDescription: "",
  });

  const [activeEmojiTab, setActiveEmojiTab] = useState("Homes");
  const [showSeoOptions, setShowSeoOptions] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingCategory) {
        setFormData({
          name: editingCategory.name || "",
          icon: editingCategory.icon || "🏠",
          description: editingCategory.description || "",
          parent: editingCategory.parent?._id || editingCategory.parent || "",
          displayOrder: editingCategory.displayOrder ?? 1,
          isActive: editingCategory.isActive ?? editingCategory.active ?? true,
          metaTitle: editingCategory.metaTitle || "",
          metaDescription: editingCategory.metaDescription || "",
        });
        setShowSeoOptions(Boolean(editingCategory.metaTitle || editingCategory.metaDescription));
      } else {
        setFormData({
          name: "",
          icon: "🏠",
          description: "",
          parent: "",
          displayOrder: categories.length ? categories.length + 1 : 1,
          isActive: true,
          metaTitle: "",
          metaDescription: "",
        });
        setShowSeoOptions(false);
      }
      setErrors({});
      setTouched({});
      setServerError("");
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen, editingCategory, categories]);

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

  // Slug generator for live preview
  const generateSlug = (text) =>
    (text || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const currentSlug = useMemo(() => generateSlug(formData.name), [formData.name]);

  const validateField = (field, value) => {
    let error = "";
    if (field === "name") {
      const trimmed = value.trim();
      if (!trimmed) {
        error = "Category name is required.";
      } else if (trimmed.length < 2) {
        error = "Name must be at least 2 characters.";
      } else {
        // Client-side duplicate check
        const conflict = categories.find(
          (c) =>
            (!editingCategory || c._id !== editingCategory._id) &&
            (c.name.toLowerCase() === trimmed.toLowerCase() ||
              (c.slug && c.slug.toLowerCase() === generateSlug(trimmed)))
        );
        if (conflict) {
          error = `A category named "${conflict.name}" already exists.`;
        }
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
    if (touched[field] || field === "name") {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleApplyTemplate = (tpl) => {
    setFormData((prev) => ({
      ...prev,
      name: tpl.name,
      icon: tpl.icon,
      description: tpl.description,
    }));
    setTouched((prev) => ({ ...prev, name: true }));
    setErrors((prev) => ({ ...prev, name: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameError = validateField("name", formData.name);
    setTouched({ name: true });
    setErrors({ name: nameError });

    if (nameError) return;

    setIsSubmitting(true);
    setServerError("");

    try {
      await onSubmit({
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        parent: formData.parent || null,
        displayOrder: Number(formData.displayOrder) || 0,
        metaTitle: formData.metaTitle.trim() || undefined,
        metaDescription: formData.metaDescription.trim() || undefined,
      });

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to save category. Please try again.";
      setServerError(message);
      if (message.toLowerCase().includes("already exists") || message.toLowerCase().includes("duplicate")) {
        setErrors((prev) => ({
          ...prev,
          name: "A category with this name already exists.",
        }));
      }
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
          aria-labelledby="category-modal-title"
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
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[28px] md:rounded-[36px] shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden flex flex-col my-auto z-10 max-h-[92vh]"
          >
            {/* Header */}
            <div className="px-6 py-5 md:px-8 md:py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 text-2xl shadow-sm shrink-0">
                  {formData.icon || "🏠"}
                </div>
                <div>
                  <h3
                    id="category-modal-title"
                    className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight"
                  >
                    {isEditMode ? "Edit Property Category" : "Create Property Category"}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                    Define classification cards, slugs, and navigation hierarchies.
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
                    {isEditMode ? "Category Updated!" : "Category Created!"}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                    "{formData.name}" has been successfully published to your active catalog.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
              {/* Server Alert Banner */}
              {serverError && (
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs md:text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Quick Template Selector (Only on New Category Mode) */}
              {!isEditMode && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-500" />
                      Popular Category Templates
                    </label>
                    <span className="text-[10px] text-slate-400">Click to autofill</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1.5 custom-scrollbar">
                    {CATEGORY_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.name}
                        type="button"
                        onClick={() => handleApplyTemplate(tpl)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                          formData.name === tpl.name
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20"
                        }`}
                      >
                        <span>{tpl.icon}</span>
                        <span>{tpl.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Preview Card */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center text-2xl shadow-sm shrink-0">
                    {formData.icon || "🏠"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {formData.name || "Category Name"}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                          formData.isActive
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                            : "bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {formData.isActive ? "Active" : "Hidden"}
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate font-mono mt-0.5">
                      /category/{currentSlug || "slug-preview"}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-white/5 shrink-0 flex items-center gap-1">
                  <Eye size={12} /> Live Preview
                </span>
              </div>

              {/* Name & Custom Emoji Input */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {/* Category Name */}
                <div className="sm:col-span-3 space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Category Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                      <Tag size={18} />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      placeholder="e.g. Modern Apartments, Luxury Villas"
                      disabled={isSubmitting}
                      className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border outline-none transition-all ${
                        errors.name && touched.name
                          ? "border-rose-400 dark:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                          : "border-slate-200 dark:border-white/10 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/10"
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                    />
                  </div>
                  {errors.name && touched.name && (
                    <p className="text-xs text-rose-500 font-medium flex items-center gap-1 pl-1">
                      <AlertCircle size={12} /> {errors.name}
                    </p>
                  )}
                </div>

                {/* Selected Emoji / Custom Entry */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Emoji Icon
                  </label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={(e) => handleChange("icon", e.target.value)}
                    placeholder="🏠"
                    maxLength={4}
                    disabled={isSubmitting}
                    className="w-full text-center py-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xl font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Categorized Emoji Palette */}
              <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/60 dark:border-white/5 space-y-2.5">
                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
                  <div className="flex gap-1">
                    {Object.keys(EMOJI_CATEGORIES).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveEmojiTab(tab)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          activeEmojiTab === tab
                            ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">Quick Picker</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_CATEGORIES[activeEmojiTab].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleChange("icon", emoji)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                        formData.icon === emoji
                          ? "bg-indigo-600 text-white scale-110 shadow-md ring-2 ring-indigo-400"
                          : "bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-white/5 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={2}
                  placeholder="Brief overview of property listings under this classification..."
                  disabled={isSubmitting}
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-white/10 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none disabled:opacity-60"
                />
              </div>

              {/* Hierarchy & Sorting Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Parent Category */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Parent Category (Optional)
                  </label>
                  <select
                    name="parent"
                    value={formData.parent}
                    onChange={(e) => handleChange("parent", e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-sm font-bold text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">None (Top-Level Category)</option>
                    {categories
                      .filter((c) => !editingCategory || c._id !== editingCategory._id)
                      .map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.icon ? `${c.icon} ` : ""}{c.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Display Order */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Display Priority Order
                  </label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={(e) => handleChange("displayOrder", e.target.value)}
                    min={0}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-sm font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Collapsible SEO & Meta Details */}
              <div className="border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowSeoOptions(!showSeoOptions)}
                  className="w-full p-3.5 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Globe2 size={15} className="text-indigo-600 dark:text-indigo-400" />
                    SEO Search Engine Settings (Optional)
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform ${showSeoOptions ? "rotate-180" : ""}`}
                  />
                </button>

                {showSeoOptions && (
                  <div className="p-4 space-y-3.5 bg-white dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        name="metaTitle"
                        value={formData.metaTitle}
                        onChange={(e) => handleChange("metaTitle", e.target.value)}
                        placeholder={`Find Best ${formData.name || "Properties"} for Rent & Sale`}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-medium text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Meta Description
                      </label>
                      <textarea
                        name="metaDescription"
                        value={formData.metaDescription}
                        onChange={(e) => handleChange("metaDescription", e.target.value)}
                        rows={2}
                        placeholder="Search verified listings directly from verified owners..."
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-medium text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/5">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Publish Category Visibility
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Display this category across homepage pills, filters, and exploration routes.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange("isActive", !formData.isActive)}
                  disabled={isSubmitting}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formData.isActive ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      formData.isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-3 shrink-0">
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
                      <span>{isEditMode ? "Saving Changes..." : "Creating Category..."}</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>{isEditMode ? "Save Changes" : "Add Category"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
