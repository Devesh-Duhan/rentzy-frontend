"use client";

import { useState, useEffect } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Building, MapPin, DollarSign, Home, BedDouble, Filter } from "lucide-react";
import Link from "next/link";
import axios from "@/lib/axios";
import PropertyCard from "@/components/PropertyCard";
import PropertySkeleton from "@/components/PropertySkeleton";
import Footer from "@/components/Footer";

const PROPERTY_TYPES = ["All", "Apartment", "Villa", "Flat", "House", "Plot", "Commercial"];
const BHK_OPTIONS = ["Any", "1", "2", "3", "4", "5+"];
const BEDROOM_OPTIONS = ["Any", "1", "2", "3", "4", "5+"];
const PRICE_RANGES = [
  { label: "Any", min: 0, max: Infinity },
  { label: "Under ₹20L", min: 0, max: 2000000 },
  { label: "₹20L - ₹50L", min: 2000000, max: 5000000 },
  { label: "₹50L - ₹1Cr", min: 5000000, max: 10000000 },
  { label: "₹1Cr - ₹2Cr", min: 10000000, max: 20000000 },
  { label: "Above ₹2Cr", min: 20000000, max: Infinity },
];

const CITIES = ["All", "Hisar", "Delhi", "Chandigarh", "Jaipur", "Gurugram", "Mumbai", "Bangalore"];

export default function BuyClient() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: "All",
    city: "All",
    priceRange: "Any",
    bhk: "Any",
    bedrooms: "Any",
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isFetching, isPlaceholderData, isError, error, refetch } = useQuery({
    queryKey: ["properties-buy", page, filters, searchTerm],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams({ purpose: "sell", page: String(page), limit: "12" });
      if (filters.type !== "All") params.append("type", filters.type.toLowerCase());
      if (filters.city !== "All") params.append("city", filters.city);
      if (filters.priceRange !== "Any") {
        const range = PRICE_RANGES.find((r) => r.label === filters.priceRange);
        if (range) {
          if (range.min > 0) params.append("minPrice", String(range.min));
          if (range.max < Infinity) params.append("maxPrice", String(range.max));
        }
      }
      if (filters.bhk !== "Any") params.append("bhk", filters.bhk);
      if (filters.bedrooms !== "Any") params.append("bedrooms", filters.bedrooms);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());
      const response = await axios.get(`/properties?${params.toString()}`, { signal });
      return response.data;
    },
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const properties = data?.properties || [];
  const totalPages = data?.pages || 1;

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ type: "All", city: "All", priceRange: "Any", bhk: "Any", bedrooms: "Any" });
    setSearchTerm("");
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "All" && v !== "Any") || searchTerm.trim();

  const FilterContent = ({ mobile = false }) => (
    <div className={mobile ? "space-y-5" : "space-y-6"}>
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
          <Building size={14} /> Property Type
        </label>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => handleFilterChange("type", t)}
              className={`pill text-xs ${
                filters.type === t
                  ? "active"
                  : ""
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
          <MapPin size={14} /> City
        </label>
        <select
          value={filters.city}
          onChange={(e) => handleFilterChange("city", e.target.value)}
          className="input-field"
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
          <DollarSign size={14} /> Price Range
        </label>
        <select
          value={filters.priceRange}
          onChange={(e) => handleFilterChange("priceRange", e.target.value)}
          className="input-field"
        >
          {PRICE_RANGES.map((r) => (
            <option key={r.label} value={r.label}>{r.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
          <BedDouble size={14} /> BHK
        </label>
        <div className="flex flex-wrap gap-2">
          {BHK_OPTIONS.map((b) => (
            <button
              key={b}
              onClick={() => handleFilterChange("bhk", b)}
              className={`pill text-xs ${
                filters.bhk === b
                  ? "active"
                  : ""
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
          <Home size={14} /> Bedrooms
        </label>
        <div className="flex flex-wrap gap-2">
          {BEDROOM_OPTIONS.map((b) => (
            <button
              key={b}
              onClick={() => handleFilterChange("bedrooms", b)}
              className={`pill text-xs ${
                filters.bedrooms === b
                  ? "active"
                  : ""
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
        >
          <X size={14} /> Clear All Filters
        </button>
      )}
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const createPagination = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <main className="market-browse min-h-screen bg-[var(--background)]">
      <section className="hero-section bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900">
        <div className="hero-overlay" />
        <div className="app-container relative z-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter mb-4">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">Dream Home</span>
            </h1>
            <p className="section-subtitle !text-indigo-200 !text-lg md:!text-xl max-w-2xl mx-auto">
              Browse premium properties for sale. Direct from owners, no middlemen.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by location, property name..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-indigo-300 outline-none focus:ring-2 focus:ring-amber-400/50 text-sm font-medium"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="app-container">
          <div className="flex gap-8">
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-28 app-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                    <Filter size={14} /> Filters
                  </h3>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors">
                      Clear
                    </button>
                  )}
                </div>
                <FilterContent />
              </div>
            </aside>

            <div className="flex-1 min-w-0" aria-busy={isFetching}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="section-title !text-2xl md:!text-3xl">
                    Properties for Sale
                  </h2>
                  <p className="section-subtitle">
                    {isFetching ? (isLoading ? "Loading..." : "Updating properties...") : `${properties.length} property${properties.length !== 1 ? "ies" : "y"} found`}
                  </p>
                </div>
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden btn-secondary flex items-center gap-2 !px-4 !py-2.5 text-sm"
                >
                  <SlidersHorizontal size={16} />
                  Filters
                </button>
              </div>

              {isError ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                    <X className="text-red-500" size={32} />
                  </div>
                  <h3 className="section-title !text-xl mb-2">Something went wrong</h3>
                  <p className="section-subtitle max-w-md">
                    {error?.message || "Failed to load properties. Please try again."}
                  </p>
                  <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="btn-primary mt-6"
                  >
                    Try Again
                  </button>
                </div>
              ) : isLoading ? (
                <div role="status" aria-label="Loading properties" className="app-grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {[...Array(6)].map((_, i) => (
                    <PropertySkeleton key={i} />
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                    <Search className="text-indigo-300 dark:text-indigo-400" size={36} />
                  </div>
                  <h3 className="section-title !text-xl mb-2">No Properties Found</h3>
                  <p className="section-subtitle max-w-md mb-6">
                    We couldn&apos;t find any properties matching your criteria. Try adjusting your filters.
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="btn-primary"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="app-grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                >
                  {properties.map((prop, i) => (
                    <motion.div key={prop._id || prop.id || i} variants={itemVariants} className="h-full flex">
                      <PropertyCard
                        compact
                        {...prop}
                        id={prop._id || prop.id}
                        title={prop.title}
                        location={typeof prop.location === "object" ? prop.location.address || prop.location.city || "" : prop.location}
                        price={prop.price?.toLocaleString("en-IN") || "0"}
                        images={prop.images?.length > 0 ? prop.images : [prop.image].filter(Boolean)}
                        type={Array.isArray(prop.type) ? prop.type[0] : prop.type}
                        purpose="sell"
                        area={prop.areaSqFt || prop.area}
                        bhk={prop.bedrooms || prop.bhk}
                        bathrooms={prop.bathrooms}
                        furnishing={prop.furnishing}
                        pricePerSqft={prop.pricePerSqft}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isPlaceholderData}
                    className="btn-secondary !p-0 w-11 h-11 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {createPagination().map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="text-slate-400 font-semibold px-2">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        disabled={isPlaceholderData}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-semibold transition-all ${
                          page === p
                            ? "btn-primary !p-0"
                            : "btn-secondary !p-0"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || isPlaceholderData}
                    className="btn-secondary !p-0 w-11 h-11 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm app-card rounded-none shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                <Filter size={14} /> Filters
              </h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="btn-ghost !p-2"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <FilterContent mobile />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
