"use client";

import filterStyles from "@/components/filters/Filters.module.css";
import { FilterDialog, FilterPanel, FilterLabel } from "@/components/filters/FilterUI";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { locationMetadata, searchQuery } from "@/seo/property-seo";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronDown, ChevronLeft, ChevronRight, Filter, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import Footer from "@/components/Footer";
import JsonLd from '@/seo/JsonLd';
import { collectionSchema } from '@/seo/schema';
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

export default function SearchClient({ initialData, initialQuery, initialError = false } = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const params = Object.fromEntries(
    FILTER_KEYS.map((k) => [k, searchParams.get(k) || ""])
  );
  const sortValue = searchParams.get("sort") || "relevance";
  const page = parseInt(searchParams.get("page") || "1");

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => { if (event.key === "Escape") setMobileFiltersOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileFiltersOpen]);

  const queryString = searchQuery(searchParams);

  const [retryRequested,setRetryRequested] = useState(false);
  const failedSeed = initialError && !retryRequested && queryString === initialQuery;
  const { data, isLoading, isFetching, isError: queryError, refetch } = useQuery({
    queryKey: ["search", queryString],
    queryFn: async ({ signal }) => {
      const res = await axios.get(`/search?${queryString}`, { signal });
      return res.data;
    },
    initialData: queryString === initialQuery ? initialData || undefined : undefined,
    enabled: !failedSeed,
    staleTime: 60000,
    placeholderData: previous => previous,
  });

  const showError = queryError || failedSeed;
  const properties = data?.data || data?.properties || [];
  const locationSeo = locationMetadata(searchParams,{data});
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
      router.push(`/search?${next.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const removeFilter = (key) => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(key);
    next.set("page", "1");
    router.push(`/search?${next.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    router.push("/search", { scroll: false });
  };

  const handleSortChange = (e) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("sort", e.target.value);
    next.set("page", "1");
    router.push(`/search?${next.toString()}`, { scroll: false });
  };

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("page", String(p));
    router.push(`/search?${next.toString()}`, { scroll: false });
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
      <main className="market-browse pt-28 md:pt-36 pb-28 md:pb-24">
      <JsonLd id="location-collection-schema" data={!showError && locationSeo.robots.index ? collectionSchema({canonical:locationSeo.alternates.canonical,name:locationSeo.title.absolute,properties}):null} />
        <section className="app-container">
          <motion.div
            initial={false}
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
            <aside className={filterStyles.quickAside} aria-label="Property filters"><FilterPanel bodyClassName={filterStyles.rawDialogBody}><FilterSection key={searchParams.toString()} params={params} updateParams={updateParams} clearAllFilters={clearAllFilters} /></FilterPanel></aside>

            <FilterDialog open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} bodyClassName={filterStyles.rawDialogBody}><FilterSection key={searchParams.toString()} params={params} updateParams={updateParams} clearAllFilters={clearAllFilters} mobile onApply={() => setMobileFiltersOpen(false)} /></FilterDialog>

            <div className="flex-1 min-w-0">
              {/* Results Header */}
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center justify-between gap-4 mb-6"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {showError ? "Search unavailable" : isLoading ? (
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
                    aria-label="Filter properties"
                    aria-expanded={mobileFiltersOpen}
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
                {showError ? (
                  <motion.div key="error" role="alert" initial={false} animate={{opacity:1}} className="app-card p-8 text-center">
                    <h2 className="mb-3 text-xl font-semibold">Search could not be loaded</h2>
                    <p className="text-sm text-slate-500">Please try again. Your filters have been kept.</p>
                    <button type="button" onClick={()=>{setRetryRequested(true);refetch();}} className="btn-primary mt-5">Try again</button>
                  </motion.div>
                ) : isLoading ? (
                  <motion.div
                    key="loading"
                    initial={false}
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
                    initial={false}
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
                    aria-busy={isFetching}
                    initial={false}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="app-grid"
                  >
                    {properties.map((prop, i) => (
                      <motion.div
                        key={prop._id || prop.id}
                        className="h-full flex"
                        initial={false}
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
                  initial={false}
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

function FilterSection({ params, updateParams, clearAllFilters, mobile, onApply }) {
  const [draft, setDraft] = useState(params);
  const updateDraft = (updates) => setDraft(previous => ({ ...previous, ...updates }));
  const fieldId = (name) => `${mobile ? "mobile" : "desktop"}-search-${name}`;
  const submitFilters = (event) => {
    event.preventDefault();
    updateParams(Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value.trim()])));
    onApply?.();
  };
  const resetFilters = () => {
    setDraft(Object.fromEntries(FILTER_KEYS.map(key => [key, ""])));
    clearAllFilters();
  };

  return (
    <form onSubmit={submitFilters} aria-label="Property search filters" className={filterStyles.dialogForm}>
      <div className={`${filterStyles.controls} ${filterStyles.dialogFields}`}>
        <div>
          <FilterLabel htmlFor={fieldId("q")}>Keyword</FilterLabel>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search..."
              id={fieldId("q")}
              value={draft.q}
              onChange={(e) => updateDraft({ q: e.target.value })}
              className="input-field !pl-10"
            />
          </div>
        </div>

        <div>
          <FilterLabel htmlFor={fieldId("type")}>Type</FilterLabel>
          <select
            id={fieldId("type")}
            value={draft.type}
            onChange={(e) => updateDraft({ type: e.target.value })}
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
          <FilterLabel htmlFor={fieldId("purpose")}>Purpose</FilterLabel>
          <select
            id={fieldId("purpose")}
            value={draft.purpose}
            onChange={(e) => updateDraft({ purpose: e.target.value })}
            className="input-field appearance-none cursor-pointer"
          >
            <option value="">All Purposes</option>
            <option value="rent">For Rent</option>
            <option value="sell">For Sale</option>
          </select>
        </div>

        <div>
          <FilterLabel htmlFor={fieldId("city")}>City</FilterLabel>
          <input
            type="text"
            placeholder="e.g. Hisar"
            id={fieldId("city")}
            value={draft.city}
            onChange={(e) => updateDraft({ city: e.target.value })}
            className="input-field min-w-0"
          />
        </div>

        <div>
          <FilterLabel>Price Range</FilterLabel>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              id={fieldId("minPrice")}
              aria-label="Minimum price"
              step="any"
              min="0"
              value={draft.minPrice}
              onChange={(e) => updateDraft({ minPrice: e.target.value })}
              className="input-field min-w-0"
            />
            <span className="text-slate-400 font-bold text-xs">-</span>
            <input
              type="number"
              placeholder="Max"
              id={fieldId("maxPrice")}
              aria-label="Maximum price"
              step="any"
              min="0"
              value={draft.maxPrice}
              onChange={(e) => updateDraft({ maxPrice: e.target.value })}
              className="input-field min-w-0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FilterLabel htmlFor={fieldId("bedrooms")}>Bedrooms</FilterLabel>
            <select
              id={fieldId("bedrooms")}
              value={draft.bedrooms}
              onChange={(e) => updateDraft({ bedrooms: e.target.value })}
              className="input-field appearance-none cursor-pointer"
            >
              <option value="">Any</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}+</option>
              ))}
            </select>
          </div>
          <div>
            <FilterLabel htmlFor={fieldId("bathrooms")}>Bathrooms</FilterLabel>
            <select
              id={fieldId("bathrooms")}
              value={draft.bathrooms}
              onChange={(e) => updateDraft({ bathrooms: e.target.value })}
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
          <FilterLabel>Furnishing</FilterLabel>
          <div className="flex flex-wrap gap-1.5">
            {['furnished', 'semi-furnished', 'unfurnished'].map((opt) => (
              <button
                key={opt}
                aria-pressed={draft.furnishing === opt}
                type="button"
                onClick={() => updateDraft({ furnishing: draft.furnishing === opt ? '' : opt })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  draft.furnishing === opt
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
          <FilterLabel>Posted By</FilterLabel>
          <div className="flex flex-wrap gap-1.5">
            {['owner', 'broker', 'builder'].map((opt) => (
              <button
                key={opt}
                aria-pressed={draft.postedBy === opt}
                type="button"
                onClick={() => updateDraft({ postedBy: draft.postedBy === opt ? '' : opt })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  draft.postedBy === opt
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
          <FilterLabel htmlFor={fieldId("facing")}>Facing</FilterLabel>
          <select
            id={fieldId("facing")}
            value={draft.facing}
            onChange={(e) => updateDraft({ facing: e.target.value })}
            className="input-field appearance-none cursor-pointer"
          >
            <option value="">Any Facing</option>
            {['north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west'].map((f) => (
              <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}</option>
            ))}
          </select>
        </div>

        <div>
          <FilterLabel htmlFor={fieldId("possession")}>Possession</FilterLabel>
          <select
            id={fieldId("possession")}
            value={draft.possession}
            onChange={(e) => updateDraft({ possession: e.target.value })}
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
          <FilterLabel>Area Range (sqft)</FilterLabel>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              id={fieldId("minArea")}
              aria-label="Minimum area"
              step="any"
              min="0"
              value={draft.minArea}
              onChange={(e) => updateDraft({ minArea: e.target.value })}
              className="input-field min-w-0"
            />
            <span className="text-slate-400 font-bold text-xs">-</span>
            <input
              type="number"
              placeholder="Max"
              id={fieldId("maxArea")}
              aria-label="Maximum area"
              step="any"
              min="0"
              value={draft.maxArea}
              onChange={(e) => updateDraft({ maxArea: e.target.value })}
              className="input-field min-w-0"
            />
          </div>
        </div>
      </div>
      <div className={filterStyles.actions}>
        <button type="button" onClick={resetFilters} className="btn-secondary flex min-h-11 items-center justify-center gap-2 !px-3 text-sm"><RotateCcw size={16} aria-hidden="true" />Clear</button>
        <button type="submit" className="btn-primary flex min-h-11 flex-1 items-center justify-center gap-2 !px-3 text-sm"><Filter size={16} aria-hidden="true" />Apply Filters</button>
      </div>
    </form>
  );
}
