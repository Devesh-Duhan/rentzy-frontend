"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BellOff,
  Plus,
  Trash2,
  Search,
  Clock,
  MapPin,
  Home,
  X,
  ChevronDown,
  Filter,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import toast from "react-hot-toast";
import Footer from "@/components/Footer";

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "instant", label: "Instant" },
];

const defaultForm = {
  keyword: "",
  type: "",
  purpose: "",
  city: "",
  minPrice: "",
  maxPrice: "",
  bedrooms: "",
  bathrooms: "",
  frequency: "daily",
};

function AlertForm({ onSubmit, onCancel, initial }) {
  const [form, setForm] = useState(initial || defaultForm);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
            Keyword
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="e.g. 2BHK apartment"
              value={form.keyword}
              onChange={(e) => handleChange("keyword", e.target.value)}
              className="input-field pl-9"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
            City
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="e.g. Hisar"
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className="input-field pl-9"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
            Type
          </label>
          <select
            value={form.type}
            onChange={(e) => handleChange("type", e.target.value)}
            className="input-field cursor-pointer appearance-none"
          >
            <option value="">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="flat">Flat</option>
            <option value="room">Room</option>
            <option value="building">Building</option>
            <option value="shop">Shop</option>
            <option value="office">Office</option>
            <option value="land">Land</option>
            <option value="pg_hostel">PG / Hostel</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
            Purpose
          </label>
          <select
            value={form.purpose}
            onChange={(e) => handleChange("purpose", e.target.value)}
            className="input-field cursor-pointer appearance-none"
          >
            <option value="">All</option>
            <option value="rent">For Rent</option>
            <option value="sell">For Sale</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
            Min Price
          </label>
          <input
            type="number"
            placeholder="Min"
            value={form.minPrice}
            onChange={(e) => handleChange("minPrice", e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
            Max Price
          </label>
          <input
            type="number"
            placeholder="Max"
            value={form.maxPrice}
            onChange={(e) => handleChange("maxPrice", e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
            Bedrooms
          </label>
          <select
            value={form.bedrooms}
            onChange={(e) => handleChange("bedrooms", e.target.value)}
            className="input-field cursor-pointer appearance-none"
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}+</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
            Bathrooms
          </label>
          <select
            value={form.bathrooms}
            onChange={(e) => handleChange("bathrooms", e.target.value)}
            className="input-field cursor-pointer appearance-none"
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}+</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
          Frequency
        </label>
        <div className="relative inline-block">
          <select
            value={form.frequency}
            onChange={(e) => handleChange("frequency", e.target.value)}
            className="input-field pr-10 cursor-pointer appearance-none"
          >
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn-ghost"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          Create Alert
        </button>
      </div>
    </form>
  );
}

export default function AlertsClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const res = await axios.get("/alerts");
      return res.data;
    },
    enabled: !!user,
  });

  const alerts = data?.alerts || data || [];

  const createMutation = useMutation({
    mutationFn: async (alertData) => {
      const res = await axios.post("/alerts", alertData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      setShowCreateModal(false);
      toast.success("Alert created successfully");
    },
    onError: () => {
      toast.error("Failed to create alert");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }) => {
      await axios.put(`/alerts/${id}`, { active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast.success("Alert updated");
    },
    onError: () => {
      toast.error("Failed to update alert");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/alerts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast.success("Alert deleted");
    },
    onError: () => {
      toast.error("Failed to delete alert");
    },
  });

  const getChipLabel = (key, value) => {
    if (!value) return null;
    const labels = {
      keyword: "Keyword",
      type: "Type",
      purpose: "Purpose",
      city: "City",
      minPrice: "Min",
      maxPrice: "Max",
      bedrooms: "Beds",
      bathrooms: "Baths",
    };
    return `${labels[key] || key}: ${value}`;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <main className="pt-28 md:pt-36 pb-24">
        <div className="app-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10"
          >
            <div>
              <div className="pill bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50 mb-4">
                <Bell size={14} /> Property Alerts
              </div>
              <h1 className="section-title">
                Your Alerts
              </h1>
              <p className="section-subtitle">
                Get notified when new properties match your search criteria.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary inline-flex items-center gap-2 shrink-0"
            >
              <Plus size={16} /> New Alert
            </button>
          </motion.div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="app-card p-6 animate-pulse"
                  >
                    <div className="h-5 bg-slate-100 dark:bg-slate-700 rounded-lg w-1/3 mb-3" />
                    <div className="h-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg w-2/3" />
                  </div>
                ))}
              </motion.div>
            ) : alerts.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="app-card py-20 flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-300 dark:text-amber-400 mb-5">
                  <Bell size={28} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  No alerts yet
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
                  Create a property alert and we&apos;ll notify you when new listings match your preferences.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus size={16} /> Create Your First Alert
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {alerts.map((alert, i) => {
                  const criteria = alert.criteria || alert;
                  const isActive = alert.active !== false;

                  return (
                    <motion.div
                      key={alert._id || alert.id || i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="app-card p-5 md:p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${
                                isActive
                                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                  : "bg-slate-300 dark:bg-slate-600"
                              }`}
                            />
                            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                              <Clock size={12} />
                              {alert.frequency || criteria.frequency || "daily"}
                            </span>
                            {alert.lastMatchedCount !== undefined && (
                              <span className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg">
                                <Filter size={11} />
                                {alert.lastMatchedCount} matched
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(criteria).map(([key, value]) => {
                              const label = getChipLabel(key, value);
                              if (!label) return null;
                              return (
                                <span
                                  key={key}
                                  className="pill text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-0"
                                >
                                  {label}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() =>
                              toggleMutation.mutate({
                                id: alert._id || alert.id,
                                active: !isActive,
                              })
                            }
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                              isActive
                                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                            title={isActive ? "Deactivate" : "Activate"}
                          >
                            {isActive ? <Bell size={16} /> : <BellOff size={16} />}
                          </button>
                          <button
                            onClick={() =>
                              deleteMutation.mutate(alert._id || alert.id)
                            }
                            className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all flex items-center justify-center"
                            title="Delete alert"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="app-card p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Bell size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        New Alert
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Get notified when properties match your criteria
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <AlertForm
                  onSubmit={(data) => createMutation.mutate(data)}
                  onCancel={() => setShowCreateModal(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
