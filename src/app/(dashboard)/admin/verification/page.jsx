"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X, Search, Loader2, Building2, MapPin, Calendar, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import axios from "@/lib/axios";
import toast from "react-hot-toast";

export default function VerificationPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await axios.get("/admin/properties");
      setProperties(res.data);
    } catch {
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (property) => {
    try {
      await axios.put(`/admin/properties/${property._id}/verify`);
      setProperties((prev) =>
        prev.map((p) =>
          p._id === property._id
            ? { ...p, isVerified: true, verifiedAt: new Date().toISOString() }
            : p
        )
      );
      toast.success(`"${property.title}" verified`);
    } catch {
      toast.error("Verification failed");
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    try {
      await axios.put(`/admin/properties/${rejectModal._id}/reject`, { reason: rejectReason });
      setProperties((prev) =>
        prev.map((p) =>
          p._id === rejectModal._id
            ? { ...p, isVerified: false, verifiedAt: null, rejectionReason: rejectReason }
            : p
        )
      );
      toast.success(`"${rejectModal.title}" rejected`);
      setRejectModal(null);
      setRejectReason("");
    } catch {
      toast.error("Failed to reject");
    }
  };

  const unverified = properties.filter((p) => !p.isVerified);
  const verified = properties.filter((p) => p.isVerified);

  const filtered = (list) =>
    list.filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        p.title?.toLowerCase().includes(q) ||
        p.sellerId?.name?.toLowerCase().includes(q) ||
        p.location?.city?.toLowerCase().includes(q)
      );
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Property Verification</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            {unverified.length} pending · {verified.length} verified
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all"
          />
        </div>
      </div>

      {unverified.length > 0 && (
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-rose-500 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} /> Pending Verification ({unverified.length})
          </h3>
          <div className="space-y-3">
            {filtered(unverified).map((p) => (
              <PropertyCard
                key={p._id}
                property={p}
                expanded={expanded === p._id}
                onToggle={() => setExpanded(expanded === p._id ? null : p._id)}
                onVerify={handleVerify}
                onReject={(prop) => {
                  setRejectModal(prop);
                  setRejectReason(prop.rejectionReason || "");
                }}
              />
            ))}
          </div>
        </div>
      )}

      {verified.length > 0 && (
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500 mb-3 flex items-center gap-2">
            <CheckCircle2 size={16} /> Verified ({verified.length})
          </h3>
          <div className="space-y-2">
            {filtered(verified).map((p) => (
              <VerifiedRow key={p._id} property={p} />
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {rejectModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectModal(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-white dark:bg-slate-900 z-[110] rounded-[32px] p-6 shadow-2xl border border-slate-100 dark:border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Reject Property</h3>
                <button onClick={() => setRejectModal(null)} className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium">
                Rejecting <span className="font-bold text-slate-900 dark:text-white">{rejectModal?.title}</span>
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
                rows={4}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-rose-100/50 transition-all resize-none mb-6"
              />
              <div className="flex gap-4">
                <button onClick={() => setRejectModal(null)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                  Cancel
                </button>
                <button onClick={handleReject} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-rose-700 transition-all">
                  Reject
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PropertyCard({ property, expanded, onToggle, onVerify, onReject }) {
  const seller = property.sellerId || {};
  const locationStr = property.location
    ? [property.location.city, property.location.state].filter(Boolean).join(", ")
    : "N/A";

  return (
    <motion.div layout className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={onToggle}>
        <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0">
          {property.images?.[0] ? (
            <img src={property.images[0]} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <Building2 size={24} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-slate-900 dark:text-white truncate">{property.title}</p>
          <div className="flex items-center gap-3 mt-1 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1"><MapPin size={12} /> {locationStr}</span>
            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(property.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-wider">
            Pending
          </span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 dark:border-slate-700"
          >
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seller</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{seller.name || "N/A"}</p>
                  <p className="text-xs text-slate-400">{seller.email || ""}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">₹{property.price?.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 capitalize">{property.status}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Posted</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{new Date(property.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Documents</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{property.images?.length || 0} images</p>
                </div>
              </div>
              {property.description && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Description</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{property.description}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => onVerify(property)}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} /> Verify
                </button>
                <button
                  onClick={() => onReject(property)}
                  className="flex-1 py-3 bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl font-black text-sm hover:bg-rose-200 dark:hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <X size={16} /> Reject
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function VerifiedRow({ property }) {
  const locationStr = property.location
    ? [property.location.city, property.location.state].filter(Boolean).join(", ")
    : "N/A";

  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
        <CheckCircle2 size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-slate-900 dark:text-white truncate">{property.title}</p>
        <p className="text-xs font-medium text-slate-400 flex items-center gap-1 mt-0.5">
          <MapPin size={12} /> {locationStr}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-black text-slate-900 dark:text-white">₹{property.price?.toLocaleString()}</p>
        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-wider">Verified</p>
      </div>
    </div>
  );
}
