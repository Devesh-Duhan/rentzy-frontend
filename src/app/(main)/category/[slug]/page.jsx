"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag,
  ChevronRight,
  Search,
  SlidersHorizontal,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import Footer from "@/components/Footer";
import axiosInstance from "@/lib/axios";
import PropertyCard from "@/components/PropertyCard";

export default function CategoryPage({ params }) {
  const resolvedParams = params && typeof params.then === "function" ? React.use(params) : params;
  const slug = resolvedParams?.slug;
  const router = useRouter();
  const searchParams = useSearchParams();
  const subQuery = searchParams.get('sub');
  
  const [category, setCategory] = useState(null);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [activeSubIndex, setActiveSubIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const listingsRef = useRef(null);

  // Fetch category data from API
  useEffect(() => {
    const fetchCategory = async () => {
      if (!slug) return;
      setIsCategoryLoading(true);
      try {
        const { data } = await axiosInstance.get(`/categories/${slug}`);
        if (data?.data) {
          setCategory(data.data);
        } else {
          setCategory(null);
        }
      } catch (err) {
        console.error("Failed to load category from API:", err);
        setCategory(null);
      } finally {
        setIsCategoryLoading(false);
      }
    };
    fetchCategory();
  }, [slug]);

  // Sync active subcategory with query parameter and scroll
  useEffect(() => {
    if (category && category.sub?.length && subQuery) {
      const idx = category.sub.findIndex((s) => s.name === subQuery || s.slug === subQuery);
      if (idx !== -1) {
        setActiveSubIndex(idx);
        setTimeout(() => {
          listingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
      }
    }
  }, [subQuery, category]);

  // Fetch properties matching category
  useEffect(() => {
    const fetchCategoryProperties = async () => {
      if (!category) return;
      setIsLoadingProperties(true);
      try {
        const activeSub = activeSubIndex !== null && category.sub ? category.sub[activeSubIndex] : null;
        
        let types = [category.slug || slug];
        if (activeSub && (activeSub.slug || activeSub.type || activeSub.name)) {
          types.push(activeSub.slug || activeSub.type || activeSub.name.toLowerCase());
        }

        const { data } = await axiosInstance.get(`/properties`, {
          params: { type: types.join(',') }
        });
        setProperties(data.properties || []);
      } catch (e) {
        console.error("Fetch properties failed", e);
      } finally {
        setIsLoadingProperties(false);
      }
    };
    if (category) fetchCategoryProperties();
  }, [slug, category, activeSubIndex]);

  const formatProperty = (prop) => ({
    id: prop._id || prop.id,
    title: prop.title,
    location: `${prop.location?.address || ''}, ${prop.location?.city || ''}`,
    price: prop.price?.toLocaleString(),
    images: (prop.images?.filter(Boolean) ?? []).length > 0 ? prop.images.filter(Boolean) : [],
    type: prop.type,
    purpose: prop.purpose || 'rent',
    isNew: prop.isNew || (new Date() - new Date(prop.createdAt) < 7 * 24 * 60 * 60 * 1000),
    hasPrivateMedia: prop.images?.length > 1
  });

  if (isCategoryLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-400">Loading category...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Tag size={36} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Category Not Found</h1>
          <p className="text-sm text-slate-500 mb-6">
            The category you are looking for may have been removed or does not exist.
          </p>
          <Link href="/" className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all inline-block shadow-lg">
            ← Explore Categories
          </Link>
        </div>
      </div>
    );
  }

  const activeSub = activeSubIndex !== null && category.sub ? category.sub[activeSubIndex] : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Banner */}
      <section className="relative pt-36 pb-20 bg-gradient-to-br from-indigo-700 via-purple-700 to-slate-900 overflow-hidden text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/20 blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4" />
        </div>
        <div className="app-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 md:gap-4 mb-5">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-2xl md:rounded-3xl flex items-center justify-center text-3xl shadow-xl flex-shrink-0 border border-white/20">
                <span>{category.icon || "🏠"}</span>
              </div>
              <div>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-indigo-200">
                  Property Classification
                </p>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                  {category.name || category.label || slug}
                </h1>
              </div>
            </div>

            {category.description && (
              <p className="text-white/80 text-base md:text-lg font-medium max-w-xl mb-8 leading-relaxed">
                {category.description}
              </p>
            )}

            {/* Search within category */}
            <div className="glass-effect bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl md:rounded-[24px] p-1.5 md:p-2 flex items-center gap-2 md:gap-3 max-w-lg shadow-2xl">
              <Search size={16} className="text-white/60 ml-3 flex-shrink-0" />
              <input
                type="text"
                placeholder={`Search in ${category.name || "category"}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim() !== "") {
                    router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=${category.slug || slug}`);
                  }
                }}
                className="flex-1 bg-transparent text-white placeholder-white/60 text-xs md:text-sm font-bold outline-none w-full"
              />
              <button
                onClick={() => {
                  if (searchQuery.trim() !== "") {
                    router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=${category.slug || slug}`);
                  }
                }}
                className="px-4 md:px-6 py-2.5 md:py-3 bg-white text-slate-900 rounded-xl md:rounded-[18px] text-[10px] md:text-xs font-black hover:bg-slate-100 transition-all shrink-0 active:scale-95 shadow-md"
              >
                Search
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Subcategory Cards (if any defined in Admin) */}
      {category.sub && category.sub.length > 0 && (
        <section className="py-12 app-container border-b border-slate-200/60 dark:border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title text-xl md:text-2xl font-bold">
                Browse {category.name} Sub-types
              </h2>
              <p className="text-xs text-slate-500 font-medium">Select a sub-category to refine listings</p>
            </div>
            {activeSub && (
              <button
                onClick={() => setActiveSubIndex(null)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-rose-500 transition-colors uppercase tracking-wider"
              >
                Clear Filter ×
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {category.sub.map((sub, i) => (
              <motion.button
                key={sub._id || sub.name}
                onClick={() => {
                  const newIndex = activeSubIndex === i ? null : i;
                  setActiveSubIndex(newIndex);
                  if (newIndex !== null) {
                    listingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`text-left p-4 md:p-5 rounded-2xl border-2 transition-all cursor-pointer group ${
                  activeSubIndex === i
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-md"
                    : "border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-white/20 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl md:text-3xl">{sub.icon || "🏡"}</span>
                  {activeSubIndex === i && (
                    <CheckCircle2 size={18} className="text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-0.5">
                  {sub.name}
                </h3>
                {sub.description && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-2">
                    {sub.description}
                  </p>
                )}
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* Listings Grid */}
      <section className="py-12 app-container">
        <div ref={listingsRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 scroll-mt-24">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              {activeSub ? `${activeSub.name} Listings` : `All ${category.name} Listings`}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Showing verified properties matching this classification
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/properties?type=${category.slug || slug}`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <SlidersHorizontal size={14} /> Advanced Filter
            </button>
          </div>
        </div>

        <div className="app-grid min-h-[300px]">
          {isLoadingProperties ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
              <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-3" />
              <p className="text-xs font-bold uppercase tracking-wider">Loading {category.name} Properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Properties Found</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                No active properties listed under <span className="font-semibold">{category.name}</span> right now.
              </p>
              <Link
                href="/add"
                className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md"
              >
                + List a Property in this Category
              </Link>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {properties.map((prop, i) => (
                <motion.div
                  key={prop._id || prop.id}
                  layout
                  className="h-full flex"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <PropertyCard {...formatProperty(prop)} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}