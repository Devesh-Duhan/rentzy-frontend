"use client";

import filterUiStyles from "@/components/filters/Filters.module.css";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Grid, List, Sparkles, ChevronDown, SlidersHorizontal } from "lucide-react";

import axiosInstance from "@/lib/axios";

export default function FeaturedProperties() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const city = searchParams.get('city');
  const address = searchParams.get('address');
  const searchKeyword = searchParams.get('search');
  const typeFilter = searchParams.get('type');

  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState("all");
  const [totalPages, setTotalPages] = useState(1);
  const [viewType, setViewType] = useState("grid");
  const [totalResults, setTotalResults] = useState(0);

  const pageParam = parseInt(params.page) || 1;
  const currentPage = Math.max(1, pageParam);

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        let minPrice = 0;
        let maxPrice = 10000000;
        if (priceRange === "under20k") maxPrice = 20000;
        else if (priceRange === "20to50k") { minPrice = 20000; maxPrice = 50000; }
        else if (priceRange === "above50k") minPrice = 50000;

        const { data } = await axiosInstance.get('/properties', {
          params: {
            page: currentPage,
            limit: 12,
            minPrice,
            maxPrice,
            city,
            address,
            keyword: searchKeyword,
            type: typeFilter,
            sort: sortBy === 'price_low' ? 'price' : sortBy === 'price_high' ? '-price' : '-createdAt'
          }
        });

        setProperties(data.properties);
        setTotalPages(data.pages);
        setTotalResults(data.count);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [currentPage, sortBy, priceRange, city, address, searchKeyword, typeFilter]);

  const formatProperty = (prop) => ({
    id: prop._id || prop.id,
    title: prop.title,
    location: typeof prop.location === "object" && prop.location !== null
      ? [prop.location.address, prop.location.city, prop.location.state, prop.location.zipcode].filter(Boolean).join(", ")
      : (prop.location || ""),
    price: prop.price?.toLocaleString(),
    images: prop.images?.filter(Boolean) ?? [],
    type: Array.isArray(prop.type) ? prop.type[0] : prop.type,
    purpose: Array.isArray(prop.purpose) ? prop.purpose[0] : (prop.purpose || 'rent'),
    isNew: prop.isNew || (new Date() - new Date(prop.createdAt) < 7 * 24 * 60 * 60 * 1000),
    hasPrivateMedia: prop.images?.length > 1,
    bhk: prop.bhk,
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    area: prop.area,
    areaSqFt: prop.areaSqFt,
    furnishing: prop.furnishing,
    postedBy: prop.postedBy,
    pricePerSqft: prop.pricePerSqft,
    contactNumber: prop.contactNumber,
    phone: prop.phone
  });

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    if (currentPage !== 1) router.push('/featured-properties/1');
  };

  const handlePriceChange = (e) => {
    setPriceRange(e.target.value);
    if (currentPage !== 1) router.push('/featured-properties/1');
  };

  const createPagination = () => {
    let pages = [];
    if (currentPage > 2) pages.push(1);
    if (currentPage > 3) pages.push('...');
    if (currentPage > 1) pages.push(currentPage - 1);
    pages.push(currentPage);
    if (currentPage < totalPages) pages.push(currentPage + 1);
    if (currentPage < totalPages - 2) pages.push('...');
    if (currentPage < totalPages - 1 && totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-500">

      <main className="pt-24 md:pt-32 pb-24">
        {/* Header Section */}
        <section className="relative overflow-hidden mb-8 md:mb-16 px-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest mb-4 md:mb-6 border border-indigo-100 dark:border-indigo-800/50"
            >
              <Sparkles size={14} /> Exclusive Collection
            </motion.div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight"
                >
                  Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Properties</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mt-4 text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl"
                >
                  Handpicked premium listings in your preferred locations. Middleman-free deals directly from owners.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center gap-3 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <button
                  onClick={() => setViewType("grid")}
                  className={`p-3 rounded-xl transition-all ${viewType === "grid" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none" : "text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewType("list")}
                  className={`p-3 rounded-xl transition-all ${viewType === "list" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none" : "text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"}`}
                >
                  <List size={20} />
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center justify-between md:justify-start gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <span className="text-slate-400 dark:text-slate-500 font-black text-[10px] md:text-sm uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
                <span className="text-slate-600 dark:text-slate-300 font-bold text-xs md:text-sm whitespace-nowrap">
                  Showing <span className="text-indigo-600 dark:text-indigo-400 font-black">{totalResults}</span> results
                </span>
              </div>

              {/* Mobile View Toggle */}
              <div className="flex md:hidden items-center gap-1 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <button
                  onClick={() => setViewType("grid")}
                  className={`p-2 rounded-lg transition-all ${viewType === "grid" ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none" : "text-slate-400"}`}
                >
                  <Grid size={14} />
                </button>
                <button
                  onClick={() => setViewType("list")}
                  className={`p-2 rounded-lg transition-all ${viewType === "list" ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none" : "text-slate-400"}`}
                >
                  <List size={14} />
                </button>
              </div>
            </div>

            <div className={"flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0" + " " + filterUiStyles.toolbar}>
              <div className="relative group flex-shrink-0">
                <select
                  value={priceRange}
                  onChange={handlePriceChange}
                  className={"appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 md:px-5 py-2.5 md:py-3 pr-9 md:pr-10 text-xs md:text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800" + " " + filterUiStyles.filterControl}
                >
                  <option value="all">All Prices</option>
                  <option value="under20k">Under ₹20,000</option>
                  <option value="20to50k">₹20,000 - ₹50,000</option>
                  <option value="above50k">Above ₹50,000</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown size={12} />
                </div>
              </div>

              <div className="relative group flex-shrink-0">
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className={"appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 md:px-5 py-2.5 md:py-3 pr-9 md:pr-10 text-xs md:text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800" + " " + filterUiStyles.filterControl}
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="trending">Trending</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown size={12} />
                </div>
              </div>

              <button className="flex-shrink-0 px-5 md:px-6 py-2.5 md:py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xl active:scale-95 flex items-center gap-2">
                <SlidersHorizontal size={12} /> Filters
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`grid gap-8 mb-16 auto-rows-fr items-stretch ${viewType === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2 lg:gap-6"}`}
              >
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="h-full flex">
                    <div className="h-full w-full flex flex-col bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-sm animate-pulse">
                      <div className="bg-slate-100 dark:bg-slate-800 aspect-[4/3] w-full flex-shrink-0"></div>
                      <div className="p-4 md:p-5 flex-1 flex flex-col">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-3/4"></div>
                        <div className="h-3 bg-slate-50 dark:bg-slate-800/50 rounded-full w-1/2 mt-2"></div>
                        <div className="h-5 bg-slate-50 dark:bg-slate-800/50 rounded-full w-1/3 mt-2.5"></div>
                        <div className="h-7 bg-slate-100 dark:bg-slate-800 rounded-xl w-2/3 mt-auto pt-3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={`grid gap-8 mb-20 auto-rows-fr items-stretch ${viewType === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2 lg:gap-6"}`}
              >
                {properties.map((prop) => (
                  <motion.div key={prop._id || prop.id} variants={itemVariants} className="h-full flex">
                    <PropertyCard {...formatProperty(prop)} layout={viewType} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col md:flex-row items-center justify-between gap-8 pt-12 border-t border-slate-200 dark:border-slate-800"
          >
            <div className="hidden md:flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm font-medium">
              Click to navigate or use keyboard arrows
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/featured-properties/${currentPage - 1}`)}
                disabled={currentPage === 1}
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm group"
                aria-label="Previous page"
              >
                <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <div className="flex items-center px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[22px] shadow-sm">
                {createPagination().map((p, i) => {
                  if (p === '...') {
                    return <span key={`ellipsis-${i}`} className="text-slate-300 dark:text-slate-700 font-black px-3 select-none">···</span>
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => typeof p === 'number' && router.push(`/featured-properties/${p}`)}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${currentPage === p
                        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none scale-105"
                        : "text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => router.push(`/featured-properties/${currentPage + 1}`)}
                disabled={currentPage === totalPages}
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm group"
                aria-label="Next page"
              >
                <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="md:hidden text-slate-400 text-xs font-semibold uppercase tracking-widest">
              Page {currentPage} / {totalPages}
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
