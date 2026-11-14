"use client";

import { useState, useEffect } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "@/lib/axios";
import PropertyCard from "@/components/PropertyCard";
import PropertySkeleton from "@/components/PropertySkeleton";
import styles from "@/components/filters/Filters.module.css";
import PropertyQuickFilters from "@/components/filters/PropertyQuickFilters";
import { FilterDialog } from "@/components/filters/FilterUI";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import JsonLd from '@/seo/JsonLd';
import { collectionSchema } from '@/seo/schema';
import { PAGE_SEO } from '@/seo';

const PROPERTY_TYPES = ["All", "Apartment", "Villa", "Flat", "House", "PG", "Commercial"];
const BHK_OPTIONS = ["Any", "1", "2", "3", "4", "5+"];
const BEDROOM_OPTIONS = ["Any", "1", "2", "3", "4", "5+"];
const PRICE_RANGES = [
  { label: "Any", min: 0, max: Infinity },
  { label: "Under ₹10K", min: 0, max: 10000 },
  { label: "₹10K - ₹20K", min: 10000, max: 20000 },
  { label: "₹20K - ₹50K", min: 20000, max: 50000 },
  { label: "₹50K - ₹1L", min: 50000, max: 100000 },
  { label: "Above ₹1L", min: 100000, max: Infinity },
];

const CITIES = ["All", "Hisar", "Delhi", "Chandigarh", "Jaipur", "Gurugram", "Mumbai", "Bangalore"];

export default function RentClient({ initialData, initialError = false } = {}) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: "All",
    city: "All",
    priceRange: "Any",
    bhk: "Any",
    bedrooms: "Any",
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [retryRequested,setRetryRequested] = useState(false);
  const failedSeed = initialError && !retryRequested && page === 1 && Object.values(filters).every(value=>value==='All'||value==='Any');
  const { data, isLoading, isFetching, isPlaceholderData, isError: queryError, error, refetch } = useQuery({
    queryKey: ["properties-rent", page, filters],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams({ purpose: "rent", page: String(page), limit: "12" });
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
      const response = await axios.get(`/properties?${params.toString()}`, { signal });
      return response.data;
    },
    initialData: page === 1 && Object.values(filters).every(value => value === 'All' || value === 'Any') ? initialData || undefined : undefined,
    enabled: !failedSeed,
    staleTime: 60000,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const isError = queryError || failedSeed;
  const properties = data?.properties || [];
  const totalPages = data?.pages || 1;

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ type: "All", city: "All", priceRange: "Any", bhk: "Any", bedrooms: "Any" });
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "All" && v !== "Any");

  const renderFilters = (idPrefix) => <PropertyQuickFilters filters={filters} onChange={handleFilterChange} onClear={clearFilters} hasActiveFilters={hasActiveFilters} idPrefix={idPrefix} types={PROPERTY_TYPES} cities={CITIES} priceRanges={PRICE_RANGES} bhkOptions={BHK_OPTIONS} bedroomOptions={BEDROOM_OPTIONS} />;

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
    <main className="market-browse min-h-screen bg-[var(--background)] pt-[calc(var(--header-height,80px)+1.5rem)]">
      <JsonLd id="rental-collection-schema" data={!isError && !isLoading ? collectionSchema({canonical:"/rent",name:PAGE_SEO["/rent"].title,properties}):null} />

      <section className="pb-12">
        <div className="app-container max-w-[1600px]">
          <div className="flex gap-6 lg:gap-8 items-start">
            <aside
              aria-label="Property filters"
              className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 sticky top-[calc(var(--header-height,80px)+1.5rem)] self-start max-h-[calc(100dvh-var(--header-height,80px)-2.5rem)] rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden z-20"
            >
              {/* Flipkart-style Fixed Filter Header */}
              <div className="flex shrink-0 items-center justify-between px-4 py-3.5 border-b border-border bg-card">
                <span className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Filters
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 uppercase tracking-wider transition-colors"
                    aria-label="Clear all filters"
                  >
                    CLEAR ALL
                  </button>
                )}
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-4 overscroll-contain">
                {renderFilters('rent-desktop')}
              </div>
            </aside>

            <div className="flex-1 min-w-0" aria-busy={isFetching}>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/60 gap-3">
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                    Properties for Rent
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isFetching ? (isLoading ? "Loading..." : "Updating properties...") : `${properties.length} propert${properties.length !== 1 ? "ies" : "y"} found`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 h-9 px-3.5 text-xs font-semibold rounded-xl"
                  aria-label="Filters"
                >
                  <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500 text-white">
                      Active
                    </span>
                  )}
                </Button>
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
                    onClick={() => { setRetryRequested(true); refetch(); }}
                    disabled={isFetching}
                    className="btn-primary mt-6"
                  >
                    Try Again
                  </button>
                </div>
              ) : isLoading ? (
                <div role="status" aria-label="Loading properties" className="app-grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
                  initial={false}
                  animate="visible"
                  className="app-grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
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
                        purpose="rent"
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

      <FilterDialog open={showMobileFilters} onClose={() => setShowMobileFilters(false)} label="Filters" footer={<button type="button" onClick={() => setShowMobileFilters(false)} className={styles.applyButton}><Search size={17} />View properties</button>}>{renderFilters('rent-mobile')}</FilterDialog>

      <Footer />
    </main>
  );
}
