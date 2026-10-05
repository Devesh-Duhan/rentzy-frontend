"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  User,
  Shield,
  Building2,
  UserCheck,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  KeyRound,
} from "lucide-react";

const ROLE_OPTIONS = [
  {
    id: "buyer",
    title: "Buyer / Tenant",
    description: "Browse properties, schedule site visits, book PG/rentals",
    icon: User,
    color: "indigo",
    badge: "Default Access",
  },
  {
    id: "seller",
    title: "Seller / Owner",
    description: "Publish & manage property listings, collect rent, view inquiries",
    icon: Building2,
    color: "emerald",
    badge: "Listing Rights",
  },
  {
    id: "admin",
    title: "Administrator",
    description: "Full system control, user governance, analytics & settings",
    icon: Shield,
    color: "purple",
    badge: "Full Privilege",
  },
];

export default function InviteUserModal({ isOpen, onClose, onInviteSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "buyer",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: "", email: "", role: "buyer" });
      setErrors({});
      setTouched({});
      setServerError("");
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Keyboard accessibility: Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Real-time validation helper
  const validateField = (field, value) => {
    let error = "";
    if (field === "name") {
      if (!value.trim()) {
        error = "Full name is required.";
      } else if (value.trim().length < 2) {
        error = "Name must be at least 2 characters.";
      }
    }
    if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) {
        error = "Email address is required.";
      } else if (!emailRegex.test(value.trim())) {
        error = "Please enter a valid email address.";
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
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const nameError = validateField("name", formData.name);
    const emailError = validateField("email", formData.email);

    setTouched({ name: true, email: true });
    setErrors({ name: nameError, email: emailError });

    if (nameError || emailError) {
      return;
    }

    setIsSubmitting(true);
    setServerError("");

    try {
      await onInviteSuccess(formData);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to dispatch invitation. Please try again.";
      setServerError(message);
      if (message.toLowerCase().includes("already exists")) {
        setErrors((prev) => ({
          ...prev,
          email: "This email is already registered in the platform.",
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
          aria-labelledby="invite-user-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isSubmitting ? onClose : undefined}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[28px] md:rounded-[32px] shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden flex flex-col my-auto z-10"
          >
            {/* Header */}
            <div className="px-6 py-5 md:px-8 md:py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
                  <UserCheck size={22} className="shrink-0" />
                </div>
                <div>
                  <h3
                    id="invite-user-modal-title"
                    className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight"
                  >
                    Invite New User
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                    Send an invitation with provisioned platform credentials.
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

            {/* Success Overlay View */}
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
                    Invitation Dispatched!
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                    Account created for <span className="font-semibold text-slate-800 dark:text-slate-200">{formData.email}</span> with default access key.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              {/* Server Alert Banner */}
              {serverError && (
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs md:text-sm animate-shake">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Full Name Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    placeholder="e.g. Sarah Jenkins"
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

              {/* Email Address Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Work / Personal Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    placeholder="e.g. sarah.jenkins@company.com"
                    disabled={isSubmitting}
                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border outline-none transition-all ${
                      errors.email && touched.email
                        ? "border-rose-400 dark:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                        : "border-slate-200 dark:border-white/10 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/10"
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  />
                </div>
                {errors.email && touched.email && (
                  <p className="text-xs text-rose-500 font-medium flex items-center gap-1 pl-1">
                    <AlertCircle size={12} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Role Selection Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Assign Account Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {ROLE_OPTIONS.map((opt) => {
                    const isSelected = formData.role === opt.id;
                    const Icon = opt.icon;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleChange("role", opt.id)}
                        disabled={isSubmitting}
                        className={`relative p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                          isSelected
                            ? "bg-indigo-50/60 dark:bg-indigo-500/10 border-indigo-500 dark:border-indigo-400 shadow-sm ring-1 ring-indigo-500/20"
                            : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15"
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              isSelected
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                                : "bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border border-slate-200/60 dark:border-white/5"
                            }`}
                          >
                            <Icon size={16} />
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isSelected
                                ? "bg-indigo-100 dark:bg-indigo-400/20 text-indigo-700 dark:text-indigo-300"
                                : "bg-slate-200/60 dark:bg-white/5 text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {opt.badge}
                          </span>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {opt.title}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                            {opt.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Information Notice */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-800/30 flex items-start gap-2.5 text-xs text-indigo-950 dark:text-indigo-200">
                <KeyRound size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Invited users receive default initial access (<code className="font-bold text-indigo-700 dark:text-indigo-300">password123</code>). They will be prompted to reset their password upon first sign-in.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-3">
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
                      <span>Sending Invitation...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Send Invitation</span>
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
