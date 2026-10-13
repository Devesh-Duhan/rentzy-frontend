"use client";

import { useState, useEffect } from "react";
import {
  Plus, Trash2, Edit2, Check, X as XIcon, Crown, Eye, EyeOff,
  Star, Zap, RefreshCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "@/lib/axios";
import toast from "react-hot-toast";

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "", price: "", discountPrice: "", duration: "30",
    maxProperties: 1, features: [""], popular: false, isActive: true
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ id: null, name: "" });

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get("/admin/subscription-plans");
      setPlans(data);
    } catch {
      toast.error("Failed to fetch plans.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleFeatureChange = (index, value) => {
    const updated = [...form.features];
    updated[index] = value;
    setForm({ ...form, features: updated });
  };

  const addFeature = () => {
    setForm({ ...form, features: [...form.features, ""] });
  };

  const removeFeature = (index) => {
    if (form.features.length <= 1) return;
    const updated = form.features.filter((_, i) => i !== index);
    setForm({ ...form, features: updated });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      toast.error("Name and price are required.");
      return;
    }
    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      maxProperties: Number(form.maxProperties),
      features: form.features.filter(f => f.trim()).map(name => ({ name, included: true })),
      duration: Number(form.duration),
    };
    const loading = toast.loading(isEditMode ? "Updating plan..." : "Creating plan...");
    try {
      if (isEditMode) {
        await axios.put(`/admin/subscription-plans/${editingId}`, payload);
        toast.success("Plan updated.", { id: loading });
      } else {
        await axios.post("/admin/subscription-plans", payload);
        toast.success("Plan created.", { id: loading });
      }
      fetchPlans();
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed.", { id: loading });
    }
  };

  const handleEdit = (plan) => {
    setEditingId(plan._id);
    setIsEditMode(true);
    setForm({
      name: plan.name,
      price: plan.price?.toString() || "",
      discountPrice: plan.discountPrice?.toString() || "",
      duration: String(plan.duration || 30),
      maxProperties: plan.maxProperties || 1,
      features: plan.features?.length ? plan.features.map(feature => typeof feature === "string" ? feature : feature.name || "") : [""],
      popular: plan.popular ?? false,
      isActive: plan.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (plan) => {
    setDeleteConfig({ id: plan._id, name: plan.name });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    const loading = toast.loading("Deleting plan...");
    try {
      await axios.delete(`/admin/subscription-plans/${deleteConfig.id}`);
      toast.success("Plan deleted.", { id: loading });
      fetchPlans();
    } catch {
      toast.error("Delete failed.", { id: loading });
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const toggleActive = async (plan) => {
    try {
      await axios.put(`/admin/subscription-plans/${plan._id}`, { ...plan, isActive: !plan.isActive });
      toast.success(plan.isActive ? "Deactivated" : "Activated");
      fetchPlans();
    } catch {
      toast.error("Toggle failed.");
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Subscription Plans</h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold mt-2">
            {plans.length} plans configured
          </p>
        </div>
        <button
          onClick={() => {
            setIsEditMode(false);
            setForm({ name: "", price: "", discountPrice: "", duration: "30", maxProperties: 1, features: [""], popular: false, isActive: true });
            setIsModalOpen(true);
          }}
          className="w-full md:w-auto px-6 md:px-8 py-3.5 md:py-4 bg-indigo-600 text-white rounded-[20px] md:rounded-[24px] font-black text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 shadow-2xl shadow-indigo-100 dark:shadow-none hover:bg-slate-900 transition-all"
        >
          <Plus size={18} /> Add Plan
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading plans...</p>
          </div>
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-800/40 rounded-[40px] border border-slate-100 dark:border-white/5">
          <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-[32px] flex items-center justify-center text-slate-300 mb-6">
            <Crown size={40} />
          </div>
          <h5 className="text-xl font-black text-slate-700 dark:text-white">No Plans Yet</h5>
          <p className="text-slate-400 font-bold text-sm mt-2">Create your first subscription plan to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`relative bg-white dark:bg-slate-800/40 rounded-[32px] border shadow-sm hover:shadow-xl transition-all group overflow-hidden ${
                plan.popular
                  ? "border-indigo-200 dark:border-indigo-500/30 shadow-indigo-100 dark:shadow-none"
                  : "border-slate-100 dark:border-white/5"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-l from-indigo-600 to-purple-600 text-white text-[8px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-bl-[20px] shadow-lg flex items-center gap-1.5">
                    <Star size={10} className="fill-white" /> Most Popular
                  </div>
                </div>
              )}

              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{plan.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 capitalize">{plan.duration} days</p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.popular ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-400"}`}>
                    <Crown size={22} />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">₹{plan.price?.toLocaleString()}</span>
                    {plan.discountPrice && (
                      <span className="text-lg font-bold text-slate-400 line-through">₹{plan.discountPrice?.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features?.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 mt-0.5 shrink-0">
                        <Check size={12} />
                      </div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{typeof feature === "string" ? feature : feature.name}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Up to {plan.maxProperties} properties</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(plan)}
                      className={`p-2.5 rounded-xl transition-all ${
                        plan.isActive
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100"
                          : "bg-slate-50 dark:bg-white/5 text-slate-400 hover:bg-slate-100"
                      }`}
                      title={plan.isActive ? "Deactivate" : "Activate"}
                    >
                      {plan.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => handleEdit(plan)}
                      className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-xl shadow-sm border border-slate-100 dark:border-white/5 transition-all active:scale-90"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(plan)}
                      className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 hover:bg-rose-600 hover:text-white rounded-xl shadow-sm border border-slate-100 dark:border-white/5 transition-all active:scale-90"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">{isEditMode ? "Edit Plan" : "New Plan"}</h3>
                  <p className="text-sm text-slate-500 font-medium">Configure subscription plan details.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-rose-500 transition-colors shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Plan Name</label>
                    <input name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Premium Plan" className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</label>
                    <select value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all appearance-none cursor-pointer">
                      <option value="30">Monthly</option>
                      <option value="365">Yearly</option>
                      <option value="90">Quarterly</option>
                      <option value="3650">10 years</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price (₹)</label>
                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="999" className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Discount Price (₹) — optional</label>
                    <input type="number" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} placeholder="1499" className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Max Properties</label>
                  <input type="number" value={form.maxProperties} onChange={(e) => setForm({ ...form, maxProperties: parseInt(e.target.value) || 1 })} min="1" className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Features</label>
                    <button
                      type="button"
                      onClick={addFeature}
                      className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Feature
                    </button>
                  </div>
                  {form.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder="e.g. 24/7 Support"
                        className="flex-1 p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-3 text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-30"
                        disabled={form.features.length <= 1}
                      >
                        <XIcon size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Popular Badge</span>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, popular: !form.popular })}
                      className={`relative w-14 h-7 rounded-full transition-all ${form.popular ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"}`}
                    >
                      <div className={`absolute w-5 h-5 bg-white rounded-full top-1 shadow transition-all ${form.popular ? "left-8" : "left-1"}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
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
              </div>

              <div className="p-8 border-t border-slate-50 dark:border-white/5 flex gap-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-[20px] font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Cancel</button>
                <button onClick={handleSubmit} className="flex-1 py-4 bg-indigo-600 text-white rounded-[20px] font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  {isEditMode ? "Save Changes" : "Create Plan"}
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
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Delete Plan?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8">
                Delete plan <span className="text-slate-900 dark:text-white font-bold">"{deleteConfig.name}"</span>? This cannot be undone.
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
