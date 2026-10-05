"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, TrendingUp, ShieldCheck, Users } from "lucide-react";
import axios from "@/lib/axios";

const FEATURES = [
  { icon: ShieldCheck, label: "0% Brokerage", desc: "Direct owner deals" },
  { icon: Users, label: "10K+ Listings", desc: "Verified properties" },
  { icon: TrendingUp, label: "Best Prices", desc: "Negotiate directly" },
];

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=80",
];

export default function HeroSlider({ onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await axios.get("/categories");
        const list = Array.isArray(data) ? data : data?.data || data?.categories || [];
        setCategories(list);
      } catch (err) {
        console.error("Failed to load categories in hero slider:", err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/properties");
    }
  };

  return (
    <section className="relative h-[70svh] min-h-[480px] md:min-h-[700px] overflow-hidden">
      {/* Background Images */}
      {HERO_IMAGES.map((img, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? "opacity-100" : "opacity-0"}`}
          style={{
            background: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%), url(${img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 via-transparent to-indigo-900/20" />

      {/* Slide indicators */}
      <div className="absolute bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === currentSlide ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[10px] sm:text-xs font-semibold mb-4 sm:mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              India&apos;s #1 Direct Property Platform
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-3 sm:mb-4">
              Find Your Perfect
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                Home Sweet Home
              </span>
            </h1>

            <p className="text-sm sm:text-lg md:text-xl text-white/80 max-w-xl mb-6 sm:mb-8 font-medium">
              Rent or buy directly from owners — zero brokerage, 100% verified properties across India.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            ref={searchRef}
            className="relative max-w-2xl"
          >
            <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-2xl">
              <div className="flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-4">
                <Search size={18} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  placeholder="Search by city, locality, or property type..."
                  className="flex-1 py-2 sm:py-3 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none text-sm sm:text-base font-medium"
                />
              </div>
              <button
                type="submit"
                className="btn-primary flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl whitespace-nowrap"
              >
                <Search size={16} />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>

            {/* Search Suggestions */}
            <AnimatePresence>
              {showResults && searchQuery.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 max-h-60 overflow-y-auto"
                >
                  {categories.filter((c) => (c.name || "").toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                    categories.filter((c) => (c.name || "").toLowerCase().includes(searchQuery.toLowerCase())).map((cat) => (
                      <button
                        key={cat._id || cat.slug || cat.name}
                        onClick={() => {
                          router.push(`/category/${cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-')}`);
                          setShowResults(false);
                          setSearchQuery("");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left"
                      >
                        <span className="text-xl">{cat.icon || "🏠"}</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{cat.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-400">No matching categories</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Category Pills */}
          {categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex gap-2 mt-5 sm:mt-8 overflow-x-auto no-scrollbar pb-1 sm:pb-2"
            >
              {categories.map((cat) => (
                <button
                  key={cat._id || cat.slug || cat.name}
                  onClick={() => router.push(`/category/${cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-')}`)}
                  className="category-pill flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full backdrop-blur-md transition-all active:scale-95 shrink-0"
                >
                  <span className="text-base sm:text-lg">{cat.icon || "🏠"}</span>
                  <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">{cat.name}</span>
                </button>
              ))}
            </motion.div>
          )}

          {/* Feature Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="hidden md:flex items-center gap-8 mt-12"
          >
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <f.icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{f.label}</p>
                  <p className="text-white/60 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
