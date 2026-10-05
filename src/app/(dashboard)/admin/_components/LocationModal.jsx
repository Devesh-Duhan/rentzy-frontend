"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Building,
  Navigation,
  Compass,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Eye,
  Globe2,
  Milestone,
} from "lucide-react";

const LOCATION_TYPES = [
  {
    id: "city",
    title: "City",
    description: "Major metropolitan or regional urban center",
    icon: Building,
    color: "purple",
    badge: "Tier 1/2 Hub",
  },
  {
    id: "area",
    title: "Area / Sector",
    description: "Zonal district, suburb, or municipal sector",
    icon: MapPin,
    color: "indigo",
    badge: "Sub-district",
  },
  {
    id: "locality",
    title: "Locality",
    description: "Specific neighborhood, colony, or market pocket",
    icon: Navigation,
    color: "cyan",
    badge: "Micro-market",
  },
];

const COMMON_STATES = [
  "Maharashtra",
  "Delhi NCR",
  "Karnataka",
  "Telangana",
  "Haryana",
  "Uttar Pradesh",
  "Tamil Nadu",
  "Gujarat",
  "West Bengal",
  "Rajasthan",
  "Punjab",
  "Kerala",
  "Goa",
];

export default function LocationModal({
  isOpen,
  onClose,
  locations = [],
  editingLocation = null,
  onSubmit,
}) {
  const isEditMode = Boolean(editingLocation);

  const [formData, setFormData] = useState({
    name: "",
    type: "city",
    parent: "",
    state: "Maharashtra",
    pincode: "",
    latitude: "",
    longitude: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingLocation) {
        setFormData({
          name: editingLocation.name || "",
          type: editingLocation.type || "city",
          parent: editingLocation.parent?._id || editingLocation.parent || "",
          state: editingLocation.state || "Maharashtra",
          pincode: editingLocation.pincode || "",
          latitude: editingLocation.coordinates?.lat?.toString() || editingLocation.latitude?.toString() || "",
          longitude: editingLocation.coordinates?.lng?.toString() || editingLocation.longitude?.toString() || "",
          isActive: editingLocation.isActive ?? editingLocation.active ?? true,
        });
      } else {
        setFormData({
          name: "",
          type: "city",
          parent: "",
          state: "Maharashtra",
          pincode: "",
          latitude: "",
          longitude: "",
          isActive: true,
        });
      }
      setErrors({});
      setTouched({});
      setServerError("");
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen, editingLocation]);

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

  const validateField = (field, value) => {
    let error = "";
    if (field === "name") {
      if (!value.trim()) {
        error = "Location name is required.";
      } else if (value.trim().length < 2) {
        error = "Name must be at least 2 characters.";
      }
    }
    if (field === "pincode" && value.trim()) {
      const pinRegex = /^[1-9][0-9]{5}$/;
      if (!pinRegex.test(value.trim())) {
        error = "Please enter a valid 6-digit postal pincode.";
      }
    }
    if (field === "latitude" && value.trim()) {
      const lat = parseFloat(value);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        error = "Latitude must be between -90 and 90.";
      }
    }
    if (field === "longitude" && value.trim()) {
      const lng = parseFloat(value);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        error = "Longitude must be between -180 and 180.";
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

    const nameError = validateField("name", formData.name);
    const pinError = validateField("pincode", formData.pincode);
    const latError = validateField("latitude", formData.latitude);
    const lngError = validateField("longitude", formData.longitude);

    setTouched({ name: true, pincode: true, latitude: true, longitude: true });
    setErrors({
      name: nameError,
      pincode: pinError,
      latitude: latError,
      longitude: lngError,
    });

    if (nameError || pinError || latError || lngError) return;

    setIsSubmitting(true);
    setServerError("");

    try {
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        parent: formData.parent || null,
        state: formData.state.trim(),
        pincode: formData.pincode.trim() || undefined,
        isActive: formData.isActive,
        coordinates:
          formData.latitude && formData.longitude
            ? {
                lat: parseFloat(formData.latitude),
                lng: parseFloat(formData.longitude),
              }
            : undefined,
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
        "Failed to save location. Please try again.";
      setServerError(message);
      if (message.toLowerCase().includes("already exists") || message.toLowerCase().includes("duplicate")) {
        setErrors((prev) => ({
          ...prev,
          name: "A location with this name already exists.",
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Parent location helper
  const parentLocation = locations.find((l) => l._id === formData.parent);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="location-modal-title"
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
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[28px] md:rounded-[32px] shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden flex flex-col my-auto z-10 max-h-[92vh]"
          >
            {/* Header */}
            <div className="px-6 py-5 md:px-8 md:py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
                  <MapPin size={22} className="shrink-0" />
                </div>
                <div>
                  <h3
                    id="location-modal-title"
                    className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight"
                  >
                    {isEditMode ? "Edit Geographical Location" : "Add New Location"}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                    Configure cities, suburban areas & neighborhood sectors.
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
                    {isEditMode ? "Location Updated!" : "Location Registered!"}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                    "{formData.name}" ({formData.type}) has been successfully saved to your territory database.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 md:p-8 space-y-5 custom-scrollbar">
              {/* Server Alert Banner */}
              {serverError && (
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs md:text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Live Preview Card */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm shrink-0">
                    {formData.type === "city" ? (
                      <Building size={18} />
                    ) : formData.type === "area" ? (
                      <MapPin size={18} />
                    ) : (
                      <Navigation size={18} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {formData.name || "Location Name"}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          formData.type === "city"
                            ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300"
                            : formData.type === "area"
                            ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300"
                            : "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300"
                        }`}
                      >
                        {formData.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                      {parentLocation ? `${parentLocation.name} › ` : ""}
                      {formData.state ? `${formData.state}, India` : "India"}
                      {formData.pincode ? ` (${formData.pincode})` : ""}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-white/5 shrink-0 flex items-center gap-1">
                  <Eye size={12} /> Live Preview
                </span>
              </div>

              {/* Location Type Selector Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Location Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {LOCATION_TYPES.map((opt) => {
                    const isSelected = formData.type === opt.id;
                    const Icon = opt.icon;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleChange("type", opt.id)}
                        disabled={isSubmitting}
                        className={`relative p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                          isSelected
                            ? "bg-indigo-50/60 dark:bg-indigo-500/10 border-indigo-500 dark:border-indigo-400 shadow-sm ring-1 ring-indigo-500/20"
                            : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15"
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                              isSelected
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                                : "bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border border-slate-200/60 dark:border-white/5"
                            }`}
                          >
                            <Icon size={14} />
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
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

              {/* Name & Pincode Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Location Name */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Location Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                      <Milestone size={18} />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      placeholder={
                        formData.type === "city"
                          ? "e.g. Mumbai, Bangalore, Pune"
                          : formData.type === "area"
                          ? "e.g. Andheri West, Whitefield"
                          : "e.g. Lokhandwala Complex, Sector 62"
                      }
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

                {/* Postal Pincode */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Pincode
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={(e) => handleChange("pincode", e.target.value)}
                      onBlur={() => handleBlur("pincode")}
                      placeholder="e.g. 400053"
                      maxLength={6}
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border outline-none transition-all ${
                        errors.pincode && touched.pincode
                          ? "border-rose-400 dark:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                          : "border-slate-200 dark:border-white/10 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                      }`}
                    />
                  </div>
                  {errors.pincode && touched.pincode && (
                    <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 pl-1">
                      <AlertCircle size={10} /> {errors.pincode}
                    </p>
                  )}
                </div>
              </div>

              {/* State & Parent Hierarchy Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* State Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    State / Region
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="indian-states-list"
                      name="state"
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      placeholder="Select or enter state..."
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-sm font-bold text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all"
                    />
                    <datalist id="indian-states-list">
                      {COMMON_STATES.map((st) => (
                        <option key={st} value={st} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Parent Hierarchy */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Parent City / Area
                  </label>
                  <div className="relative">
                    <select
                      name="parent"
                      value={formData.parent}
                      onChange={(e) => handleChange("parent", e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-sm font-bold text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">None (Top-Level City)</option>
                      {locations
                        .filter((l) => !editingLocation || l._id !== editingLocation._id)
                        .map((loc) => (
                          <option key={loc._id} value={loc._id}>
                            {loc.name} ({loc.type})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Geographic Coordinates (Optional) */}
              <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/60 dark:border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Compass size={14} className="text-indigo-600 dark:text-indigo-400" />
                    Map Coordinates (Optional)
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Used for Map Search & Radials</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      value={formData.latitude}
                      onChange={(e) => handleChange("latitude", e.target.value)}
                      onBlur={() => handleBlur("latitude")}
                      placeholder="e.g. 19.0760"
                      disabled={isSubmitting}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none transition-all"
                    />
                    {errors.latitude && touched.latitude && (
                      <p className="text-[10px] text-rose-500 mt-1">{errors.latitude}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      value={formData.longitude}
                      onChange={(e) => handleChange("longitude", e.target.value)}
                      onBlur={() => handleBlur("longitude")}
                      placeholder="e.g. 72.8777"
                      disabled={isSubmitting}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none transition-all"
                    />
                    {errors.longitude && touched.longitude && (
                      <p className="text-[10px] text-rose-500 mt-1">{errors.longitude}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/5">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Publish Location Visibility
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Enable to activate this territory in search filters and property uploads.
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
                      <span>{isEditMode ? "Saving Changes..." : "Adding Location..."}</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>{isEditMode ? "Save Changes" : "Add Location"}</span>
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
