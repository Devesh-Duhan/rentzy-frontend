"use client";
import ContentSkeleton from "@/components/ContentSkeleton";


import { useQuery } from "@tanstack/react-query";
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
  
  const [activeSubIndex, setActiveSubIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const listingsRef = useRef(null);

  const { data: category, isLoading: isCategoryLoading, isError: categoryError, refetch: retryCategory } = useQuery({
    queryKey: ["public-category", slug],
    queryFn: async () => (await axiosInstance.get(`/categories/${slug}`)).data?.data || null,
    enabled: !!slug,
    retry: (count, error) => error.response?.status !== 404 && count < 1,
  });

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

  const { data: properties = [], isLoading: isLoadingProperties, isError: propertiesError, refetch: retryProperties } = useQuery({
    queryKey: ["category-properties", slug, category?.slug, activeSubIndex],
    queryFn: async ({ signal }) => {
      const sub = activeSubIndex !== null ? category.sub?.[activeSubIndex] : null;
      const types = [category.slug || slug];
      if (sub) types.push(sub.slug || sub.type || sub.name.toLowerCase());
      const { data } = await axiosInstance.get("/properties", { params: { type: types.join(",") }, signal });
      return data.properties || [];
    },
    enabled: !!category,
  });

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


  if ((!isCategoryLoading && !category && !categoryError) || (categoryError && !category)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Tag size={36} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{categoryError ? "Could not load category" : "Category Not Found"}</h1>
          <p className="text-sm text-slate-500 mb-6">
            The category you are looking for may have been removed or does not exist.
          </p>
          {categoryError && <button onClick={() => retryCategory()} className="btn-secondary mb-4">Try again</button>}
          <Link href="/" className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all inline-block shadow-lg">
            ← Explore Categories
          </Link>
        </div>
      </div>
    );
  }

  const displayCategory = category || { name: slug, slug, sub: [] };
  const activeSub = activeSubIndex !== null && displayCategory.sub ? displayCategory.sub[activeSubIndex] : null;

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
                <span>{displayCategory.icon || "🏠"}</span>
              </div>
              <div>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-indigo-200">
                  Property Classification
                </p>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                  {displayCategory.name || displayCategory.label || slug}
                </h1>
              </div>
            </div>

            {displayCategory.description && (
              <p className="text-white/80 text-base md:text-lg font-medium max-w-xl mb-8 leading-relaxed">
                {displayCategory.description}
              </p>
            )}

            {/* Search within category */}
            <div className="glass-effect bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl md:rounded-[24px] p-1.5 md:p-2 flex items-center gap-2 md:gap-3 max-w-lg shadow-2xl">
              <Search size={16} className="text-white/60 ml-3 flex-shrink-0" />
              <input
                type="text"
                placeholder={`Search in ${displayCategory.name || "category"}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim() !== "") {
                    router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=${displayCategory.slug || slug}`);
                  }
                }}
                className="flex-1 bg-transparent text-white placeholder-white/60 text-xs md:text-sm font-bold outline-none w-full"
              />
              <button
                onClick={() => {
                  if (searchQuery.trim() !== "") {
                    router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=${displayCategory.slug || slug}`);
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
      {displayCategory.sub && displayCategory.sub.length > 0 && (
        <section className="py-12 app-container border-b border-slate-200/60 dark:border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title text-xl md:text-2xl font-bold">
                Browse {displayCategory.name} Sub-types
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
            {displayCategory.sub.map((sub, i) => (
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
              {activeSub ? `${activeSub.name} Listings` : `All ${displayCategory.name} Listings`}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Showing verified properties matching this classification
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/properties?type=${displayCategory.slug || slug}`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <SlidersHorizontal size={14} /> Advanced Filter
            </button>
          </div>
        </div>

        <div className="app-grid min-h-[300px]">
          {isCategoryLoading || isLoadingProperties ? (
 <ContentSkeleton label="Loading category properties" className="col-span-full app-grid" itemClassName="h-64" />
 ) : propertiesError ? <div role="alert" className="col-span-full">Could not load properties. <button onClick={() => retryProperties()} className="btn-secondary">Try again</button></div> : properties.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Properties Found</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                No active properties listed under <span className="font-semibold">{displayCategory.name}</span> right now.
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