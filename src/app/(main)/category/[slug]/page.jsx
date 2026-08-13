"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Building2,
  Factory,
  Sprout,
  UsersRound,
  CalendarDays,
  ChevronRight,
  Search,
  SlidersHorizontal,
  MapPin,
  IndianRupee,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Footer from "@/components/Footer";
import axiosInstance from "@/lib/axios";
import PropertyCard from "@/components/PropertyCard";

const CATEGORIES = {
  residential: {
    label: "Residential",
    icon: Home,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    gradient: "from-indigo-600 to-violet-600",
    description: "Find your perfect home — rooms, flats, villas, apartments and more.",
    sub: [
      { name: "Rooms", type: "residential", desc: "Single furnished & unfurnished rooms", icon: "🛏️" },
      { name: "Flats / Apartments", type: "apartment", desc: "1BHK, 2BHK, 3BHK and more", icon: "🏢" },
      { name: "Independent House / Villa", type: "villa", desc: "Spacious standalone homes", icon: "🏡" },
      { name: "Builder Floor", type: "building", desc: "Floor-wise residential units", icon: "🏗️" },
      { name: "Flatmates / Shared Rooms", type: "residential", desc: "Share with like-minded people", icon: "🤝" },
    ],
  },
  commercial: {
    label: "Commercial",
    icon: Building2,
    color: "text-amber-600",
    bg: "bg-amber-50",
    gradient: "from-amber-500 to-orange-600",
    description: "Premium business spaces — shops, offices, showrooms and co-working.",
    sub: [
      { name: "Shops", type: "shop", desc: "Retail and street-level shops", icon: "🏪" },
      { name: "Offices", type: "office", desc: "Corporate and professional offices", icon: "🏢" },
      { name: "Showrooms", type: "commercial", desc: "Large display and sales spaces", icon: "🖼️" },
      { name: "Co-working Spaces", type: "office", desc: "Flexible shared work environments", icon: "💼" },
    ],
  },
  industrial: {
    label: "Industrial",
    icon: Factory,
    color: "text-slate-600",
    bg: "bg-slate-50",
    gradient: "from-slate-600 to-slate-800",
    description: "Industrial units for manufacturing, storage, and heavy operations.",
    sub: [
      { name: "Warehouses", type: "godown", desc: "Large storage and distribution centers", icon: "🏭" },
      { name: "Factories", type: "industrial", desc: "Industrial manufacturing facilities", icon: "⚙️" },
    ],
  },
  land: {
    label: "Land",
    icon: Sprout,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    gradient: "from-emerald-600 to-teal-600",
    description: "Invest in the ground — residential, commercial, and agricultural plots.",
    sub: [
      { name: "Residential Plot", type: "land", desc: "Plots approved for home construction", icon: "📐" },
      { name: "Commercial Plot", type: "land", desc: "Land for business and commercial use", icon: "🏗️" },
      { name: "Agricultural Land", type: "land", desc: "Farming and cultivation lands", icon: "🌾" },
    ],
  },
  "pg-hostel": {
    label: "PG / Hostel",
    icon: UsersRound,
    color: "text-rose-600",
    bg: "bg-rose-50",
    gradient: "from-rose-500 to-pink-600",
    description: "Comfortable paying guest and hostel options across India.",
    sub: [
      { name: "Boys PG", type: "pg_hostel", desc: "Safe and affordable boys accommodation", icon: "👦" },
      { name: "Girls PG", type: "pg_hostel", desc: "Secure and comfortable girls PG", icon: "👧" },
      { name: "Co-living", type: "pg_hostel", desc: "Modern community living spaces", icon: "🏘️" },
    ],
  },
  "short-term": {
    label: "Short-Term Rentals",
    icon: CalendarDays,
    color: "text-purple-600",
    bg: "bg-purple-50",
    gradient: "from-purple-600 to-indigo-600",
    description: "Flexible daily, weekly stays and vacation rentals for all budgets.",
    sub: [
      { name: "Daily / Weekly Stays", type: "short_term", desc: "Flexible short-term accommodations", icon: "📅" },
      { name: "Vacation Rentals", type: "short_term", desc: "Holiday homes and resort villas", icon: "🏖️" },
    ],
  },
};

import { useSearchParams } from "next/navigation";

export default function CategoryPage({ params }) {
  const slug = params.slug;
  const router = useRouter();
  const searchParams = useSearchParams();
  const subQuery = searchParams.get('sub');
  
  const category = CATEGORIES[slug];
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubIndex, setActiveSubIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const listingsRef = useRef(null);

  // Sync active subcategory with query parameter and scroll
  useEffect(() => {
    if (category && subQuery) {
      const idx = category.sub.findIndex(s => s.name === subQuery);
      if (idx !== -1) {
        setActiveSubIndex(idx);
        // Small delay to ensure render
        setTimeout(() => {
          listingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
      }
    }
  }, [subQuery, category]);

  useEffect(() => {
    const fetchCategoryProperties = async () => {
      setIsLoading(true);
      try {
        const activeSub = activeSubIndex !== null ? category.sub[activeSubIndex] : null;
        
        // Build types array: always include main category slug, plus subcategory type if selected
        let types = [slug === 'pg-hostel' ? 'pg_hostel' : slug === 'short-term' ? 'short_term' : slug];
        if (activeSub && activeSub.type) {
          types.push(activeSub.type);
        }

        const { data } = await axiosInstance.get(`/properties`, {
          params: { type: types.join(',') }
        });
        setProperties(data.properties);
      } catch (e) {
        console.error("Fetch failed", e);
      } finally {
        setIsLoading(false);
      }
    };
    if (category) fetchCategoryProperties();
  }, [slug, category, activeSubIndex]);

  const formatProperty = (prop) => ({
    id: prop._id || prop.id,
    title: prop.title,
    location: `${prop.location?.address || ''}, ${prop.location?.city || ''}`,
    price: prop.price?.toLocaleString(),
    images: prop.images && prop.images.length > 0 ? prop.images : [prop.image || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"],
    type: prop.type,
    purpose: prop.purpose || 'rent',
    isNew: prop.isNew || (new Date() - new Date(prop.createdAt) < 7 * 24 * 60 * 60 * 1000),
    hasPrivateMedia: prop.images?.length > 1
  });

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="section-title">Category not found</h1>
          <Link href="/" className="mt-4 inline-block text-indigo-600 font-bold">
            ← Back Home
          </Link>
        </div>
      </div>
    );
  }

  const Icon = category.icon;
  const activeSub = activeSubIndex !== null ? category.sub[activeSubIndex] : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* Hero Banner */}
      <section className={`relative pt-36 pb-24 bg-gradient-to-br ${category.gradient} overflow-hidden`}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/10 blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4" />
        </div>
        <div className="app-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 md:gap-4 mb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-2xl md:rounded-3xl flex items-center justify-center text-white shadow-xl flex-shrink-0">
                <Icon size={32} className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div>
                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.25em] text-white/60">Property Type</p>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{category.label}</h1>
              </div>
            </div>
            <p className="text-white/80 text-lg font-medium max-w-xl mb-8">{category.description}</p>

            {/* Search */}
            <div className="glass-effect rounded-2xl md:rounded-[24px] p-1.5 md:p-2 flex items-center gap-2 md:gap-3 max-w-lg">
              <Search size={16} className="text-white/60 ml-3 flex-shrink-0" />
              <input
                type="text"
                placeholder={`Search ...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim() !== '') {
                    router.push(`/featured-properties/1?search=${encodeURIComponent(searchQuery)}&type=${slug}`);
                  }
                }}
                className="flex-1 bg-transparent text-white placeholder-white/50 text-xs md:text-sm font-bold outline-none w-full"
              />
              <button
                onClick={() => {
                  if (searchQuery.trim() !== '') {
                    router.push(`/featured-properties/1?search=${encodeURIComponent(searchQuery)}&type=${slug}`);
                  }
                }}
                className="px-4 md:px-6 py-2.5 md:py-3 bg-white text-slate-900 rounded-xl md:rounded-[18px] text-[10px] md:text-xs font-black hover:bg-slate-100 transition-colors shrink-0"
              >
                Search
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Subcategory Cards */}
      <section className="py-16 app-container">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="section-title">Browse {category.label} Types</h2>
            <p className="section-subtitle">Select a type to filter listings</p>
          </div>
          {activeSub && (
            <button
              onClick={() => setActiveSubIndex(null)}
              className="text-xs font-black text-slate-500 hover:text-rose-500 transition-colors uppercase tracking-widest"
            >
              Clear Filter ×
            </button>
          )}
        </div>

        <div className="app-grid mb-16">
          {category.sub.map((sub, i) => (
            <motion.button
              key={sub.name}
              onClick={() => {
                const newIndex = activeSubIndex === i ? null : i;
                setActiveSubIndex(newIndex);
                if (newIndex !== null) {
                  listingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`text-left p-5 md:p-6 rounded-[24px] md:rounded-[28px] border-2 transition-all cursor-pointer group ${activeSubIndex === i
                ? `border-current bg-white shadow-xl shadow-slate-200/50 ${category.color}`
                : "border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-md"
                }`}
            >
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <span className="text-2xl md:text-3xl">{sub.icon}</span>
                {activeSubIndex === i && <CheckCircle2 size={20} className={`${category.color} w-[18px] h-[18px] md:w-5 md:h-5`} />}
              </div>
              <h3 className={`font-black text-sm md:text-base mb-1 ${activeSubIndex === i ? category.color : "text-slate-900 dark:text-white"}`}>
                {sub.name}
              </h3>
              <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium mb-3 leading-relaxed line-clamp-2 md:line-clamp-none">{sub.desc}</p>
              <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${category.bg} ${activeSubIndex === i ? category.color : "text-slate-500 dark:text-slate-400"
                }`}>
                Browse
              </span>
            </motion.button>
          ))}
        </div>

        {/* Listings Grid */}
        <div ref={listingsRef} className="flex items-center justify-between mb-8 scroll-mt-24">
          <h2 className="section-title text-2xl">
            {activeSub ? `${activeSub.name} Listings` : `All ${category.label} Listings`}
          </h2>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <SlidersHorizontal size={15} /> Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <MapPin size={15} /> Map View
            </button>
          </div>
        </div>

        <div className="app-grid min-h-[400px]">
          {isLoading ? (
            <div className="col-span-full py-20 flex justify-center text-slate-500 dark:text-slate-400 font-bold">Loading {category.label} Properties...</div>
          ) : properties.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6">
                <Search size={32} />
              </div>
              <h3 className="section-title text-xl mb-2">No Properties Found</h3>
              <p className="section-subtitle">We couldn't find any {category.label} properties at the moment.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {properties.map((prop, i) => (
                <motion.div
                  key={prop._id || prop.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.06 }}
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