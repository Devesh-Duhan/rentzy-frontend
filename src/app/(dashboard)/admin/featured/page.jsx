"use client";
import ContentSkeleton from "@/components/ContentSkeleton";


import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, Search, Building2, MapPin } from "lucide-react";
import axios from "@/lib/axios";
import toast from "react-hot-toast";

export default function FeaturedPage() {
  const queryClient = useQueryClient();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const toggleFeatured = async (property, currentFeatured) => {
    try {
      await axios.put(`/admin/properties/${property._id}`, { featured: !currentFeatured });
      setProperties((prev) =>
        prev.map((p) => (p._id === property._id ? { ...p, featured: !currentFeatured } : p))
      );
      queryClient.invalidateQueries({ queryKey: ['home', 'category', 'featured'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success(`"${property.title}" ${!currentFeatured ? "featured" : "unfeatured"}`);
    } catch {
      toast.error("Failed to update");
    }
  };

  const filtered = properties.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.location?.city?.toLowerCase().includes(q) ||
      p.location?.state?.toLowerCase().includes(q) ||
      p.sellerId?.name?.toLowerCase().includes(q)
    );
  });

  const featured = filtered.filter((p) => p.featured);
  const notFeatured = filtered.filter((p) => !p.featured);


  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Featured Properties</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            {featured.length} featured · {notFeatured.length} available
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

      {loading ? <ContentSkeleton label="Loading featured properties" count={3} itemClassName="h-28" /> : <>
      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500 font-bold">
          <Building2 size={48} className="mx-auto mb-4 opacity-50" />
          <p>No properties found</p>
        </div>
      )}

      {featured.length > 0 && (
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-amber-500 mb-3 flex items-center gap-2">
            <Star size={16} fill="currentColor" /> Featured
          </h3>
          <div className="space-y-2">
            {featured.map((p) => (
              <PropertyRow key={p._id} property={p} onToggle={toggleFeatured} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3">All Properties</h3>
        <div className="space-y-2">
          {notFeatured.map((p) => (
            <PropertyRow key={p._id} property={p} onToggle={toggleFeatured} />
          ))}
        </div>
      </div>
      </>}
    </motion.div>
  );
}

function PropertyRow({ property, onToggle }) {
  const locationStr = property.location
    ? [property.location.city, property.location.state].filter(Boolean).join(", ")
    : "N/A";

  return (
    <motion.div
      layout
      className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm"
    >
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
        <p className="text-xs font-medium text-slate-400 flex items-center gap-1 mt-0.5">
          <MapPin size={12} /> {locationStr}
        </p>
      </div>
      <div className="text-right shrink-0 mr-2">
        <p className="text-sm font-black text-slate-900 dark:text-white">₹{property.price?.toLocaleString()}</p>
        <p className="text-[10px] text-slate-400 font-medium capitalize">{property.status}</p>
      </div>
      <button
        onClick={() => onToggle(property, property.featured)}
        aria-label={`${property.featured ? "Unfeature" : "Feature"} ${property.title}`}
        aria-pressed={Boolean(property.featured)}
        className={`p-3 rounded-xl transition-all ${
          property.featured
            ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
            : "bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-amber-500"
        }`}
      >
        <Star size={20} fill={property.featured ? "currentColor" : "none"} />
      </button>
    </motion.div>
  );
}
