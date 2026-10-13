"use client";

import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import PropertySkeleton from "@/components/PropertySkeleton";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, MapPin, ArrowUpDown, Filter, RotateCcw, MapIcon, Bed, Bath, IndianRupee, Home, Building2, Sparkles, GripVertical } from "lucide-react";
import dynamic from "next/dynamic";

const PropertyMap = dynamic(() => import("@/components/PropertyMap"), { ssr: false });

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "flat", label: "Flat" },
  { value: "room", label: "Room" },
  { value: "shop", label: "Shop" },
  { value: "office", label: "Office" },
  { value: "land", label: "Land" },
  { value: "pg_hostel", label: "PG/Hostel" },
  { value: "building", label: "Building" },
  { value: "godown", label: "Godown" },
];

export default function PaginatedProperties() {
  const [pageParam, setPageParam] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const [filters, setFilters] = useState({
    type: "",
    purpose: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    bathrooms: "",
    city: "",
    keyword: "",
    sort: "-createdAt",
  });

  const [appliedFilters, setAppliedFilters] = useState({});

  const buildQueryString = (f) => {
    const params = new URLSearchParams();
    params.set("page", pageParam);
    if (f.keyword) params.set("keyword", f.keyword);
    if (f.type) params.set("type", f.type);
    if (f.purpose) params.set("purpose", f.purpose);
    if (f.minPrice) params.set("minPrice", f.minPrice);
    if (f.maxPrice) params.set("maxPrice", f.maxPrice);
    if (f.bedrooms) params.set("bedrooms", f.bedrooms);
    if (f.bathrooms) params.set("bathrooms", f.bathrooms);
    if (f.city) params.set("city", f.city);
    if (f.sort) params.set("sort", f.sort);
    return params.toString();
  };

  const queryString = buildQueryString(appliedFilters);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['properties', queryString],
    queryFn: async () => {
      const response = await axios.get(`/properties?${queryString}`);
      return response.data;
    },
    placeholderData: previous => previous,
  });

  const propertiesData = data?.properties || [];
  const TOTAL_PAGES = data?.pages || 1;
  const currentPage = Math.max(1, Math.min(pageParam, TOTAL_PAGES));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage, appliedFilters]);

  const applyFilters = () => {
    const applied = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== null) applied[key] = value;
    });
    setAppliedFilters(applied);
    setPageParam(1);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setFilters({ type: "", purpose: "", minPrice: "", maxPrice: "", bedrooms: "", bathrooms: "", city: "", keyword: "", sort: "-createdAt" });
    setAppliedFilters({});
    setPageParam(1);
  };

  const removeFilter = (key) => {
    const updated = { ...appliedFilters };
    delete updated[key];
    setAppliedFilters(updated);
    setFilters((prev) => ({ ...prev, [key]: "" }));
  };

  const activeFilterCount = Object.keys(appliedFilters).length;

  const FilterContent = () => (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Keyword</label>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            placeholder="Search properties..."
            className="input-field pl-10"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Property Type</label>
        <div className="grid grid-cols-2 gap-1.5">
          {PROPERTY_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilters({ ...filters, type: filters.type === t.value ? "" : t.value })}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                filters.type === t.value
                  ? "btn-primary text-white"
                  : "bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 border border-transparent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Purpose</label>
          <select
            value={filters.purpose}
            onChange={(e) => setFilters({ ...filters, purpose: e.target.value })}
            className="input-field"
          >
            <option value="">All</option>
            <option value="rent">Rent</option>
            <option value="sell">Buy</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">City</label>
          <input
            type="text"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            placeholder="e.g., Mumbai"
            className="input-field"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Min Price</label>
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            placeholder="₹ Min"
            className="input-field"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Max Price</label>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            placeholder="₹ Max"
            className="input-field"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Bedrooms</label>
          <select
            value={filters.bedrooms}
            onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
            className="input-field"
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n} BHK</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Bathrooms</label>
          <select
            value={filters.bathrooms}
            onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value })}
            className="input-field"
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}+</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Sort By</label>
        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          className="input-field"
        >
          <option value="-createdAt">Newest First</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="-views">Most Popular</option>
        </select>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={clearFilters}
          className="btn-secondary flex-1 flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} /> Clear
        </button>
        <button
          onClick={applyFilters}
          className="btn-primary flex-[2] flex items-center justify-center gap-2"
        >
          <Filter size={16} /> Apply Filters
        </button>
      </div>
    </div>
  );

  const paginationButtons = () => {
    let pages = [];
    if (currentPage > 2) pages.push(1);
    if (currentPage > 3) pages.push("...");
    if (currentPage > 1) pages.push(currentPage - 1);
    pages.push(currentPage);
    if (currentPage < TOTAL_PAGES) pages.push(currentPage + 1);
    if (currentPage < TOTAL_PAGES - 2) pages.push("...");
    if (currentPage < TOTAL_PAGES - 1) pages.push(TOTAL_PAGES);
    return pages;
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
      <div className="app-container pt-28 md:pt-36 pb-28 md:pb-20">
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-3 border border-indigo-100 dark:border-indigo-800/50">
                <Sparkles size={12} /> Discover
              </div>
              <h1 className="section-title">
                {appliedFilters.type ? `${PROPERTY_TYPES.find(t => t.value === appliedFilters.type)?.label || appliedFilters.type} ` : ""}
                Properties
              </h1>
              <p className="section-subtitle">
                Showing {propertiesData.length} of {data?.count || 0} properties
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowMap(!showMap)}
                className={`btn-secondary flex items-center gap-2 text-sm py-2.5 ${
                  showMap ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700" : ""
                }`}
              >
                <MapIcon size={16} />
                <span className="hidden sm:inline">{showMap ? 'List' : 'Map'}</span>
              </button>
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="btn-secondary flex items-center gap-2 text-sm py-2.5 relative"
              >
                <Filter size={16} />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {activeFilterCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-wrap gap-1.5 mt-4"
              >
                {Object.entries(appliedFilters)
                  .filter(([k]) => k !== "sort")
                  .map(([key, value]) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-semibold border border-indigo-100 dark:border-indigo-500/20"
                    >
                      {key === "type" ? PROPERTY_TYPES.find(t => t.value === value)?.label || value :
                       key === "purpose" ? (value === "rent" ? "For Rent" : "For Sale") :
                       key === "minPrice" ? `Min: ₹${Number(value).toLocaleString()}` :
                       key === "maxPrice" ? `Max: ₹${Number(value).toLocaleString()}` :
                       key === "bedrooms" ? `${value} BHK` :
                       key === "bathrooms" ? `${value}+ Bath` :
                       key === "keyword" ? `"${value}"` :
                       key === "city" ? `📍 ${value}` : value}
                      <button onClick={() => removeFilter(key)} className="hover:bg-indigo-200 dark:hover:bg-indigo-500/20 rounded-full p-0.5">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-slate-400 hover:text-rose-500 px-2 transition-colors"
                >
                  Clear all
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-6">
          {/* Mobile Filter Drawer - bottom sheet */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 md:hidden"
              >
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-slate-950 rounded-t-[32px] shadow-2xl p-6 overflow-y-auto safe-bottom"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal size={18} className="text-indigo-600" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Filters</h3>
                    </div>
                    <button onClick={() => setFiltersOpen(false)} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-rose-500 bg-slate-100 dark:bg-white/5 rounded-xl transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                  <FilterContent />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Filter Sidebar */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.aside
                initial={{ opacity: 0, x: -20, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 300 }}
                exit={{ opacity: 0, x: -20, width: 0 }}
                className="hidden md:block flex-shrink-0 overflow-hidden"
              >
                <div className="w-[300px] app-card p-5 sticky top-28">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal size={16} className="text-indigo-600" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Filters</h3>
                    </div>
                    <button onClick={() => setFiltersOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                  <FilterContent />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <div className="flex-1 min-w-0">
            {showMap ? (
              <div className="app-card overflow-hidden">
                <PropertyMap properties={propertiesData} height="600px" zoom={5} />
              </div>
            ) : isError ? (
              <div role="alert" className="py-16 text-center">
                <p>Properties could not be loaded.</p>
                <button className="btn-primary mt-4" onClick={() => refetch()}>Try again</button>
              </div>
            ) : isLoading ? (
              <div className="app-grid">
                {[...Array(6)].map((_, i) => <PropertySkeleton key={i} />)}
              </div>
            ) : propertiesData.length > 0 ? (
              <>
                <div className="app-grid mb-12">
                  {propertiesData.map((prop, i) => (
                    <motion.div
                      key={prop._id}
                      className="h-full flex"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                    >
                      <PropertyCard
                        {...prop}
                        id={prop._id}
                        title={prop.title}
                        location={prop.location?.address || prop.location?.city || prop.location}
                        price={prop.price}
                        images={prop.images}
                        image={prop.images?.[0]}
                        type={prop.type}
                        purpose={prop.purpose}
                        area={prop.areaSqFt || prop.area}
                        bhk={prop.bedrooms || prop.bhk}
                        bathrooms={prop.bathrooms}
                        furnishing={prop.furnishing}
                        pricePerSqft={prop.pricePerSqft}
                      />
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setPageParam(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    <ChevronDown size={16} className="rotate-90" />
                  </button>

                  {paginationButtons().map((p, i) =>
                    p === "..." ? (
                      <span key={`e-${i}`} className="text-slate-400 font-bold px-2">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPageParam(p)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all shadow-sm ${
                          currentPage === p
                            ? "btn-primary shadow-lg shadow-indigo-200"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:text-indigo-600"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => setPageParam(currentPage + 1)}
                    disabled={currentPage === TOTAL_PAGES}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    <ChevronDown size={16} className="-rotate-90" />
                  </button>
                </div>
              </>
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 app-card border-dashed">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                  <Search size={28} className="text-indigo-300 dark:text-indigo-400" />
                </div>
                <p className="font-bold text-lg text-slate-700 dark:text-white mb-1">No properties found</p>
                <p className="text-sm font-medium text-slate-400 mb-6">Try adjusting your filters or search criteria</p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
