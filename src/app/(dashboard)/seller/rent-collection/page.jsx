"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Clock,
  AlertTriangle,
  DollarSign,
  Plus,
  CheckCircle,
  X,
  Loader2,
  Search,
} from "lucide-react";
import axios from "@/lib/axios";
import toast from "react-hot-toast";

const STATUS_BADGES = {
  pending: "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
  paid: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
  overdue: "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20",
  cancelled: "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700",
};

export default function RentCollection() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ totalCollected: 0, pending: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      const [payRes, sumRes] = await Promise.all([
        axios.get("/rent-payments", { params }),
        axios.get("/rent-payments/summary"),
      ]);
      setPayments(payRes.data.data);
      setSummary(sumRes.data.data);
    } catch (err) {
      toast.error("Failed to load rent data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleMarkPaid = async (paymentId) => {
    try {
      setUpdating(paymentId);
      await axios.put(`/rent-payments/${paymentId}/status`, { status: "paid", paymentMethod: "cash" });
      toast.success("Payment marked as paid");
      fetchData();
    } catch (err) {
      toast.error("Failed to update payment");
    } finally {
      setUpdating(null);
    }
  };

  const filteredPayments = payments.filter((p) =>
    p.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.property?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.month?.includes(searchTerm)
  );

  const summaryCards = [
    { label: "Total Collected", value: `₹${(summary.totalCollected || 0).toLocaleString()}`, icon: DollarSign },
    { label: "Pending", value: summary.pending || 0, icon: Clock },
    { label: "Overdue", value: summary.overdue || 0, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="section-title">Rent Collection</h2>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 text-sm shadow-lg">
          <Plus size={16} /> Add Payment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="app-card p-5 border-l-4 border-l-indigo-600"
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon className="text-indigo-600" size={22} />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="app-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by tenant, property, or month..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["all", "pending", "paid", "overdue"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    statusFilter === s
                      ? "bg-indigo-600 text-white"
                      : "btn-secondary text-xs py-2"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-indigo-600" size={28} />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-16">
            <Wallet size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="font-bold text-lg">No payments found</p>
            <p className="text-sm text-slate-400 font-medium">Add your first rent payment to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/50">
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Property</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Tenant</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Month</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Amount</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Paid Date</th>
                  <th className="text-right px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-sm">{payment.property?.title || "N/A"}</p>
                      <p className="text-xs text-slate-400">{payment.property?.location?.city || ""}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-sm">{payment.tenantName}</p>
                      <p className="text-xs text-slate-400">{payment.tenantPhone}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-sm">{payment.month}</td>
                    <td className="px-5 py-4 font-bold text-sm">₹{payment.amount?.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_BADGES[payment.status] || ""}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {payment.status === "pending" || payment.status === "overdue" ? (
                        <button
                          onClick={() => handleMarkPaid(payment._id)}
                          disabled={updating === payment._id}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 ml-auto"
                        >
                          {updating === payment._id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                          Mark Paid
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddPaymentModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => { setShowAddModal(false); fetchData(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AddPaymentModal({ onClose, onSuccess }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    propertyId: "",
    tenantName: "",
    tenantPhone: "",
    amount: "",
    month: "",
    dueDate: "",
    notes: "",
  });

  useEffect(() => {
    axios.get("/properties/my").then((res) => {
      const data = Array.isArray(res.data) ? res.data : res.data.properties || res.data.data || [];
      setProperties(data);
    }).catch(() => toast.error("Failed to load properties"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.propertyId || !form.tenantName || !form.tenantPhone || !form.amount || !form.month) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      setLoading(true);
      await axios.post("/rent-payments", form);
      toast.success("Rent payment added successfully");
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2026, i, 1);
    return d.toISOString().slice(0, 7);
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="app-card w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Add Rent Payment</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">Property *</label>
            <select value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })} className="input-field">
              <option value="">Select property</option>
              {properties.map((p) => (
                <option key={p._id} value={p._id}>{p.title} - {p.location?.city || ""}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">Tenant Name *</label>
              <input type="text" value={form.tenantName} onChange={(e) => setForm({ ...form, tenantName: e.target.value })} className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">Tenant Phone *</label>
              <input type="text" value={form.tenantPhone} onChange={(e) => setForm({ ...form, tenantPhone: e.target.value })} className="input-field" placeholder="9876543210" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">Amount *</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input-field" placeholder="25000" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">Month *</label>
              <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} className="input-field">
                <option value="">Select month</option>
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">Due Date</label>
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="input-field resize-none" placeholder="Optional notes..." />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-3.5 shadow-lg mt-2">
            {loading ? <><Loader2 className="animate-spin" size={18} /> Adding...</> : <><Plus size={18} /> Add Payment</>}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
