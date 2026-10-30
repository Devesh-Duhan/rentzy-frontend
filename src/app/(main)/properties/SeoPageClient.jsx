"use client";

import filterStyles from "@/components/filters/Filters.module.css";
import { FilterDialog, FilterPanel, FilterLabel } from "@/components/filters/FilterUI";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import PropertySkeleton from "@/components/PropertySkeleton";
import { cardProperty } from "@/lib/property";
import { Search, X, ChevronDown, Filter, RotateCcw, Sparkles } from "lucide-react";

const PROPERTY_TYPES = [
  { value: "commercial", label: "Commercial" },
  { value: "residential", label: "Residential" },
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
  { value: "industrial", label: "Industrial" },
  { value: "short_term", label: "Short-term" },
];

function PaginatedProperties() {
  const searchParams = useSearchParams();
  const featuredOnly = searchParams.get('featured') === 'true';
  const initialPurpose = ['sell', 'rent'].includes(searchParams.get('purpose')) ? searchParams.get('purpose') : '';
  const initialType = PROPERTY_TYPES.some(type => type.value === searchParams.get('type')) ? searchParams.get('type') : '';
  const [pageParam, setPageParam] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    type: initialType,
    purpose: initialPurpose,
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    bathrooms: "",
    city: "",
    keyword: "",
    sort: "-createdAt",
  });

  const [appliedFilters, setAppliedFilters] = useState(() => ({ ...(initialType ? { type: initialType } : {}), ...(initialPurpose ? { purpose: initialPurpose } : {}) }));
  const gridClassName = `grid grid-cols-2 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 ${filtersOpen ? 'lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : featuredOnly ? 'lg:grid-cols-6' : 'lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'}`;

  const buildQueryString = (f) => {
    const params = new URLSearchParams();
    params.set("page", pageParam);
    if (featuredOnly) { params.set("featured", "true"); params.set("limit", "12"); }
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

  const { data, isLoading, isError, isPlaceholderData, refetch } = useQuery({
    queryKey: ['properties', queryString],
    queryFn: async ({ signal }) => {
      const response = await axios.get(`/properties?${queryString}`, { signal });
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
    setPageParam(1);
  };

  const activeFilterCount = Object.keys(appliedFilters).length;

  const renderFilterActions = () => (
    <div className={filterStyles.actions}>
      <button type="button" onClick={clearFilters} className="btn-secondary flex min-h-11 flex-1 items-center justify-center gap-2 !px-3 text-sm">
        <RotateCcw size={16} /> Clear
      </button>
      <button type="button" onClick={applyFilters} className="btn-primary flex min-h-11 flex-[2] items-center justify-center gap-2 !px-3 text-sm">
        <Filter size={16} /> Apply Filters
      </button>
    </div>
  );

  const renderFilters = (showActions = true) => (
    <div className={filterStyles.controls}>
      <div>
        <FilterLabel>Keyword</FilterLabel>
        <div className="relative">
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            placeholder="Search properties..."
            className="input-field !pl-10"
          />
        </div>
      </div>

      <div>
        <FilterLabel>Property Type</FilterLabel>
        <div className="grid grid-cols-2 gap-1.5">
          {PROPERTY_TYPES.map((t) => (
            <button
              key={t.value}
              aria-pressed={filters.type === t.value}
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
          <FilterLabel>Purpose</FilterLabel>
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
          <FilterLabel>City</FilterLabel>
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
          <FilterLabel>Min Price</FilterLabel>
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            placeholder="₹ Min"
            className="input-field"
          />
        </div>
        <div>
          <FilterLabel>Max Price</FilterLabel>
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
          <FilterLabel>Bedrooms</FilterLabel>
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
          <FilterLabel>Bathrooms</FilterLabel>
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
        <FilterLabel>Sort By</FilterLabel>
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

      {showActions && renderFilterActions()}
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
    <main className="market-browse min-h-screen bg-white dark:bg-slate-950">
      <div className="app-container pt-28 md:pt-36 pb-28 md:pb-20">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-3 border border-indigo-100 dark:border-indigo-800/50">
                <Sparkles size={12} /> Discover
              </div>
              <h1 className="section-title">
                {featuredOnly ? "Featured " : ""}
                {appliedFilters.type ? `${PROPERTY_TYPES.find(t => t.value === appliedFilters.type)?.label || appliedFilters.type} ` : ""}
                Properties
              </h1>
              <p className="section-subtitle">
                Showing {propertiesData.length} of {data?.count || 0} properties
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                aria-label="Filter properties"
                aria-expanded={filtersOpen}
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

        <div className={`${filterStyles.catalogLayout} ${filtersOpen ? filterStyles.catalogWithFilters : ""}`}>
          <FilterDialog open={filtersOpen} onClose={() => setFiltersOpen(false)} footer={renderFilterActions()}>{renderFilters(false)}</FilterDialog>
          {filtersOpen && <aside className={filterStyles.catalogAside} aria-label="Property filters"><FilterPanel onClose={() => setFiltersOpen(false)} footer={renderFilterActions()}>{renderFilters(false)}</FilterPanel></aside>}

          <div className="flex-1 min-w-0">
            {isError ? (
              <div role="alert" className="py-16 text-center">
                <p>Properties could not be loaded.</p>
                <button className="btn-primary mt-4" onClick={() => refetch()}>Try again</button>
              </div>
            ) : isLoading ? (
              <div className={gridClassName}>
                {[...Array(featuredOnly ? 12 : 6)].map((_, i) => <PropertySkeleton key={i} />)}
              </div>
            ) : propertiesData.length > 0 ? (
              <>
                <div className={`${gridClassName} mb-10`} aria-busy={isPlaceholderData}>
                  {propertiesData.map((prop, i) => (
                    <motion.div
                      key={prop._id}
                      className="flex h-full min-w-0"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                    >
                      <PropertyCard {...cardProperty(prop)} compact />
                    </motion.div>
                  ))}
                </div>

                <nav aria-label="Property pagination" className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setPageParam(currentPage - 1)}
                    disabled={currentPage === 1 || isPlaceholderData}
                    aria-label="Previous page"
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
                        aria-label={`Page ${p}`}
                        aria-current={currentPage === p ? 'page' : undefined}
                        disabled={isPlaceholderData}
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
                    disabled={currentPage === TOTAL_PAGES || isPlaceholderData}
                    aria-label="Next page"
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    <ChevronDown size={16} className="-rotate-90" />
                  </button>
                </nav>
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

export default function PropertiesPage() {
  return <Suspense fallback={<main className="app-container min-h-screen pt-28" role="status">Loading properties...</main>}><PaginatedProperties /></Suspense>;
}
