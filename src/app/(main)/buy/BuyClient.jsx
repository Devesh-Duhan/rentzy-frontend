"use client";

import { useState, useEffect } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import BuyFilters from "@/components/filters/PropertyQuickFilters";
import { FilterDialog } from "@/components/filters/FilterUI";
import layoutStyles from "./BuyFilters.module.css";
import filterStyles from "@/components/filters/Filters.module.css";
const styles = { ...filterStyles, ...layoutStyles };
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

  const { data, isLoading, isFetching, isPlaceholderData, isError, error, refetch } = useQuery({
    queryKey: ["properties-buy", page, filters],
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
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "All" && v !== "Any");

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
            initial={false}
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


        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className={styles.resultsContainer}>
          <div className={styles.layout}>
            <aside className={styles.sidebar} aria-label="Property filters">
              <div className={styles.filterPanel}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelHeading}>
                    <span className={styles.panelIcon}><Filter size={17} /></span>
                    <div><h3>Filters</h3><p>Fine-tune your search</p></div>
                  </div>
                  {hasActiveFilters && <button type="button" onClick={clearFilters} className={styles.resetButton} aria-label="Reset filters">Reset</button>}
                </div>
                <div className={styles.filterBody}><BuyFilters filters={filters} onChange={handleFilterChange} onClear={clearFilters} hasActiveFilters={hasActiveFilters} idPrefix="buy-desktop" types={PROPERTY_TYPES} cities={CITIES} priceRanges={PRICE_RANGES} bhkOptions={BHK_OPTIONS} bedroomOptions={BEDROOM_OPTIONS} /></div>
              </div>
            </aside>

            <div className="flex-1 min-w-0" aria-busy={isFetching}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="section-title !text-2xl md:!text-3xl">
                    Properties for Sell
                  </h2>
                  <p className="section-subtitle">
                    {isFetching ? (isLoading ? "Loading..." : "Updating properties...") : `${properties.length} ${properties.length === 1 ? "property" : "properties"} found`}
                  </p>
                </div>
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="xl:hidden btn-secondary flex items-center gap-2 !px-4 !py-2.5 text-sm"
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
                <div role="status" aria-label="Loading properties" className={styles.propertyGrid}>
                  {[...Array(10)].map((_, i) => (
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
                  className={styles.propertyGrid}
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

      <FilterDialog open={showMobileFilters} onClose={() => setShowMobileFilters(false)} label="Filters" desktopQuery="(min-width: 1280px)" footer={<button type="button" onClick={() => setShowMobileFilters(false)} className={styles.applyButton}><Search size={17} />View properties</button>}>
        <BuyFilters filters={filters} onChange={handleFilterChange} onClear={clearFilters} hasActiveFilters={hasActiveFilters} idPrefix="buy-mobile" types={PROPERTY_TYPES} cities={CITIES} priceRanges={PRICE_RANGES} bhkOptions={BHK_OPTIONS} bedroomOptions={BEDROOM_OPTIONS} />
      </FilterDialog>

      <Footer />
    </main>
  );
}
