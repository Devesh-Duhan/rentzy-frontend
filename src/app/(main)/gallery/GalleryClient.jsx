"use client";

import filterUiStyles from "@/components/filters/Filters.module.css";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  X,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ImageIcon,
  SlidersHorizontal,
} from "lucide-react";
import Footer from "@/components/Footer";

export default function GalleryClient() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const { data: propertiesData, isLoading } = useQuery({
    queryKey: ["gallery-properties"],
    queryFn: async () => {
      const res = await axios.get("/properties");
      return res.data.properties || [];
    },
  });

  const properties = useMemo(() => propertiesData || [], [propertiesData]);

  const galleryItems = useMemo(() => {
    const items = [];
    properties.forEach((p) => {
      const images = p.images || [];
      images.forEach((img, idx) => {
        items.push({
          _id: `${p._id}-${idx}`,
          propertyId: p._id,
          image: img,
          title: p.title || "Untitled",
          price: p.price,
          location: p.location?.city || p.location?.address || "",
          type: Array.isArray(p.type) ? p.type[0] : p.type || "",
          city: p.location?.city || "",
        });
      });
    });
    return items;
  }, [properties]);

  const types = useMemo(() => {
    const set = new Set();
    properties.forEach((p) => {
      const t = Array.isArray(p.type) ? p.type[0] : p.type;
      if (t) set.add(t);
    });
    return Array.from(set).sort();
  }, [properties]);

  const cities = useMemo(() => {
    const set = new Set();
    properties.forEach((p) => {
      if (p.location?.city) set.add(p.location.city);
    });
    return Array.from(set).sort();
  }, [properties]);

  const filteredItems = useMemo(() => {
    return galleryItems.filter((item) => {
      if (search && !item.title.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (typeFilter && item.type !== typeFilter) return false;
      if (cityFilter && item.city !== cityFilter) return false;
      return true;
    });
  }, [galleryItems, search, typeFilter, cityFilter]);

  const lightboxImages = useMemo(
    () => filteredItems.map((i) => i.image),
    [filteredItems]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft")
        setLightboxIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      if (e.key === "ArrowRight")
        setLightboxIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    },
    [lightboxIndex, filteredItems.length]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const currentItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="app-container pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="section-title">Property Gallery</h1>
          <p className="section-subtitle">Browse through our collection of property images</p>
        </motion.div>

        <div className={"flex flex-col md:flex-row gap-3 mb-8" + " " + filterUiStyles.toolbar}>
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by property title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={"input-field pl-12" + " " + filterUiStyles.filterControl}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={"input-field min-w-[140px]" + " " + filterUiStyles.filterControl}
          >
            <option value="">All Types</option>
            {types.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t}
              </option>
            ))}
          </select>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className={"input-field min-w-[140px]" + " " + filterUiStyles.filterControl}
          >
            <option value="">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div
                key={i}
                className="app-card overflow-hidden animate-pulse break-inside-avoid"
              >
                <div
                  className={`bg-slate-200 dark:bg-slate-700 ${
                    i % 3 === 0 ? "h-64" : i % 3 === 1 ? "h-48" : "h-80"
                  }`}
                />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
              <ImageIcon size={36} className="text-indigo-400" />
            </div>
            <h2 className="section-title text-center">No images found</h2>
            <p className="section-subtitle">
              {search || typeFilter || cityFilter
                ? "Try adjusting your search or filters."
                : "No property images available yet."}
            </p>
          </motion.div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {filteredItems.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 20) * 0.03 }}
                className="break-inside-avoid"
              >
                <button
                  onClick={() => setLightboxIndex(i)}
                  className="w-full group relative app-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-left"
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={600}
                      height={400}
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      style={{ minHeight: "180px" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <Link
                        href={`/properties/${item.propertyId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 text-slate-900 rounded-lg text-xs font-bold hover:bg-white transition-colors"
                      >
                        <ExternalLink size={12} /> View Property
                      </Link>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin size={12} />
                        {item.location || "N/A"}
                      </div>
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                        ₹{Number(item.price || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && currentItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
            >
              <X size={28} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) =>
                  prev > 0 ? prev - 1 : filteredItems.length - 1
                );
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10"
            >
              <ChevronLeft size={40} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) =>
                  prev < filteredItems.length - 1 ? prev + 1 : 0
                );
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10"
            >
              <ChevronRight size={40} />
            </button>

            <motion.div
              key={lightboxIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-5xl max-h-[90vh] w-full px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Image
                  src={currentItem.image}
                  alt={currentItem.title}
                  width={1200}
                  height={800}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
                  priority
                />
              </div>
              <div className="flex items-center justify-between mt-4 text-white">
                <div>
                  <h3 className="text-lg font-bold">{currentItem.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-white/70 mt-1">
                    <span>
                      ₹{Number(currentItem.price || 0).toLocaleString("en-IN")}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> {currentItem.location}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/properties/${currentItem.propertyId}`}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <ExternalLink size={16} /> View Property
                </Link>
              </div>
            </motion.div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm">
              {lightboxIndex + 1} / {filteredItems.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
