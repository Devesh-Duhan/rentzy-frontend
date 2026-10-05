"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Home,
  Bed,
  Bath,
  IndianRupee,
  Building2,
  Sparkles,
  Layers,
  Filter,
  RotateCcw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import PropertySkeleton from "@/components/PropertySkeleton";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "most_viewed", label: "Most Viewed" },
];

const FILTER_KEYS = [
  "q",
  "type",
  "purpose",
  "city",
  "minPrice",
  "maxPrice",
  "bedrooms",
  "bathrooms",
  "furnishing",
  "possession",
  "facing",
  "postedBy",
  "minArea",
  "maxArea",
];

const FILTER_LABELS = {
  q: "Keyword",
  type: "Type",
  purpose: "Purpose",
  city: "City",
  minPrice: "Min Price",
  maxPrice: "Max Price",
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  furnishing: "Furnishing",
  possession: "Possession",
  facing: "Facing",
  postedBy: "Posted By",
  minArea: "Min Area",
  maxArea: "Max Area",
};

export default function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const params = Object.fromEntries(
    FILTER_KEYS.map((k) => [k, searchParams.get(k) || ""])
  );
  const sort = searchParams.get("sort") || "relevance";
  const page = parseInt(searchParams.get("page") || "1");

  const [sortValue, setSortValue] = useState(sort);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const queryString = new URLSearchParams(
    Object.entries({ ...params, sort: sortValue, page: String(page) }).filter(
      ([, v]) => v
    )
  ).toString();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["search", queryString],
    queryFn: async () => {
      const res = await axios.get(`/search?${queryString}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  const properties = data?.data || data?.properties || [];
  const totalCount = data?.count || 0;
  const totalPages = data?.pages || 1;

  const updateParams = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) next.set(k, v);
        else next.delete(k);
      });
      next.set("page", "1");
      router.push(`/search?${next.toString()}`);
    },
    [searchParams, router]
  );

  const removeFilter = (key) => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(key);
    next.set("page", "1");
    router.push(`/search?${next.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/search");
  };

  const handleSortChange = (e) => {
    setSortValue(e.target.value);
    const next = new URLSearchParams(searchParams.toString());
    next.set("sort", e.target.value);
    next.set("page", "1");
    router.push(`/search?${next.toString()}`);
  };

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("page", String(p));
    router.push(`/search?${next.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilters = Object.entries(params).filter(([, v]) => v);

  const createPagination = () => {
    const pages = [];
    if (page > 2) pages.push(1);
    if (page > 3) pages.push("...");
    if (page > 1) pages.push(page - 1);
    pages.push(page);
    if (page < totalPages) pages.push(page + 1);
    if (page < totalPages - 2) pages.push("...");
    if (page < totalPages - 1) pages.push(totalPages);
    return pages;
  };

  const formatProperty = (prop) => ({
    id: prop._id || prop.id,
    title: prop.title,
    location:
      typeof prop.location === "object"
        ? `${prop.location.city || ""}, ${prop.location.state || ""}`
        : prop.location || "",
    price: prop.price?.toLocaleString("en-IN") || "0",
    images: prop.images?.filter(Boolean) ?? [],
    type: prop.type,
    purpose: prop.purpose || "rent",
    isNew:
      prop.isNew ||
      (new Date() - new Date(prop.createdAt) < 7 * 24 * 60 * 60 * 1000),
    hasPrivateMedia: prop.images?.length > 1,
    furnishing: prop.furnishing,
    postedBy: prop.postedBy,
    pricePerSqft: prop.pricePerSqft,
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <main className="pt-28 md:pt-36 pb-28 md:pb-24">
        <section className="app-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-3 border border-indigo-100 dark:border-indigo-800/50">
              <Search size={12} /> Search Results
            </div>
            <h1 className="section-title">
              Properties{" "}
              {params.q && (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  &ldquo;{params.q}&rdquo;
                </span>
              )}
            </h1>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Desktop Filter Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block w-72 shrink-0"
            >
              <div className="app-card p-5 sticky top-28">
                <FilterSection
                  params={params}
                  updateParams={updateParams}
                  activeFilters={activeFilters}
                  clearAllFilters={clearAllFilters}
                />
              </div>
            </motion.aside>

            {/* Mobile Filter Drawer */}
            <AnimatePresence>
              {mobileFiltersOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 lg:hidden"
                >
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
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
                      <button onClick={() => setMobileFiltersOpen(false)} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-rose-500 bg-slate-100 dark:bg-white/5 rounded-xl transition-colors">
                        <X size={18} />
                      </button>
                    </div>
                    <FilterSection
                      params={params}
                      updateParams={updateParams}
                      activeFilters={activeFilters}
                      clearAllFilters={clearAllFilters}
                      mobile
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 min-w-0">
              {/* Results Header */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center justify-between gap-4 mb-6"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {isLoading ? (
                      "Searching..."
                    ) : (
                      <>
                        Showing{" "}
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                          {properties.length}
                        </span>{" "}
                        of{" "}
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                          {totalCount}
                        </span>{" "}
                        properties
                      </>
                    )}
                  </span>

                  {/* Active Filter Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeFilters.slice(0, 3).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => removeFilter(key)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-semibold border border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                      >
                        {FILTER_LABELS[key] || key}: {value}
                        <X size={11} />
                      </button>
                    ))}
                    {activeFilters.length > 3 && (
                      <span className="text-xs font-semibold text-slate-400">+{activeFilters.length - 3} more</span>
                    )}
                    {activeFilters.length > 1 && (
                      <button
                        onClick={clearAllFilters}
                        className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors px-1"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden btn-secondary flex items-center gap-2 py-2.5 px-4 text-sm"
                  >
                    <Filter size={16} />
                    Filters
                    {activeFilters.length > 0 && (
                      <span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                        {activeFilters.length}
                      </span>
                    )}
                  </button>

                  {/* Sort */}
                  <div className="relative">
                    <select
                      value={sortValue}
                      onChange={handleSortChange}
                      className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer shadow-sm"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Results Grid */}
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="app-grid"
                  >
                    {[...Array(9)].map((_, i) => (
                      <PropertySkeleton key={i} />
                    ))}
                  </motion.div>
                ) : properties.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full py-24 app-card flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-300 dark:text-indigo-400 mb-5">
                      <Search size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      No properties found
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mb-8">
                      No properties found matching your criteria. Try broadening your search by adjusting filters or removing some constraints.
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="btn-primary shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                      Clear All Filters
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="app-grid"
                  >
                    {properties.map((prop, i) => (
                      <motion.div
                        key={prop._id || prop.id}
                        className="h-full flex"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.03 }}
                      >
                        <PropertyCard {...formatProperty(prop)} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pagination */}
              {totalPages > 1 && properties.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-slate-200 dark:border-slate-800"
                >
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="flex items-center px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                    {createPagination().map((p, i) =>
                      p === "..." ? (
                        <span
                          key={`e${i}`}
                          className="text-slate-300 dark:text-slate-700 font-bold px-3 select-none"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => goToPage(p)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all ${
                            page === p
                              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                              : "text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    <ChevronRight size={18} />
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function FilterSection({ params, updateParams, activeFilters, clearAllFilters, mobile }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-indigo-600" />
          <span className="text-sm font-bold text-slate-900 dark:text-white">Filters</span>
        </div>
        {activeFilters.length > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Keyword</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search..."
              defaultValue={params.q}
              onKeyDown={(e) => {
                if (e.key === "Enter") updateParams({ q: e.target.value });
              }}
              className="input-field pl-10"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Type</label>
          <select
            value={params.type}
            onChange={(e) => updateParams({ type: e.target.value })}
            className="input-field appearance-none cursor-pointer"
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
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Purpose</label>
          <select
            value={params.purpose}
            onChange={(e) => updateParams({ purpose: e.target.value })}
            className="input-field appearance-none cursor-pointer"
          >
            <option value="">All Purposes</option>
            <option value="rent">For Rent</option>
            <option value="sell">For Sale</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">City</label>
          <input
            type="text"
            placeholder="e.g. Hisar"
            defaultValue={params.city}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateParams({ city: e.target.value });
            }}
            className="input-field"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Price Range</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              defaultValue={params.minPrice}
              onKeyDown={(e) => {
                if (e.key === "Enter") updateParams({ minPrice: e.target.value });
              }}
              className="input-field"
            />
            <span className="text-slate-400 font-bold text-xs">-</span>
            <input
              type="number"
              placeholder="Max"
              defaultValue={params.maxPrice}
              onKeyDown={(e) => {
                if (e.key === "Enter") updateParams({ maxPrice: e.target.value });
              }}
              className="input-field"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Bedrooms</label>
            <select
              value={params.bedrooms}
              onChange={(e) => updateParams({ bedrooms: e.target.value })}
              className="input-field appearance-none cursor-pointer"
            >
              <option value="">Any</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}+</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Bathrooms</label>
            <select
              value={params.bathrooms}
              onChange={(e) => updateParams({ bathrooms: e.target.value })}
              className="input-field appearance-none cursor-pointer"
            >
              <option value="">Any</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}+</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Furnishing</label>
          <div className="flex flex-wrap gap-1.5">
            {['furnished', 'semi-furnished', 'unfurnished'].map((opt) => (
              <button
                key={opt}
                onClick={() => updateParams({ furnishing: params.furnishing === opt ? '' : opt })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  params.furnishing === opt
                    ? 'btn-primary text-white border-transparent'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                }`}
              >
                {opt === 'semi-furnished' ? 'Semi' : opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Posted By</label>
          <div className="flex flex-wrap gap-1.5">
            {['owner', 'broker', 'builder'].map((opt) => (
              <button
                key={opt}
                onClick={() => updateParams({ postedBy: params.postedBy === opt ? '' : opt })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  params.postedBy === opt
                    ? 'btn-primary text-white border-transparent'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                }`}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Facing</label>
          <select
            value={params.facing}
            onChange={(e) => updateParams({ facing: e.target.value })}
            className="input-field appearance-none cursor-pointer"
          >
            <option value="">Any Facing</option>
            {['north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west'].map((f) => (
              <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Possession</label>
          <select
            value={params.possession}
            onChange={(e) => updateParams({ possession: e.target.value })}
            className="input-field appearance-none cursor-pointer"
          >
            <option value="">Any Possession</option>
            <option value="ready-to-move">Ready to Move</option>
            <option value="under-construction">Under Construction</option>
            <option value="possession-1-month">Within 1 Month</option>
            <option value="possession-3-months">Within 3 Months</option>
            <option value="possession-6-months">Within 6 Months</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Area Range (sqft)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              defaultValue={params.minArea}
              onKeyDown={(e) => {
                if (e.key === "Enter") updateParams({ minArea: e.target.value });
              }}
              className="input-field"
            />
            <span className="text-slate-400 font-bold text-xs">-</span>
            <input
              type="number"
              placeholder="Max"
              defaultValue={params.maxArea}
              onKeyDown={(e) => {
                if (e.key === "Enter") updateParams({ maxArea: e.target.value });
              }}
              className="input-field"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
