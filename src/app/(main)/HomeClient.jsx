"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import HeroSlider from "@/components/HeroSlider";
import PropertyCard from "@/components/PropertyCard";
import LocationModal from "@/components/LocationModal";
import {
  Search, ChevronRight, ChevronLeft, ShieldCheck, Users, TrendingUp,
  Building2, Home, MapPin, Star, Clock, ArrowRight,
  Sparkles, Smartphone, MessageCircle, Bell, RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import PropertySkeleton from "@/components/PropertySkeleton";
import { useSelector } from "react-redux";

const GRADIENT_PALETTES = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-blue-600",
  "from-fuchsia-500 to-purple-600",
  "from-lime-500 to-emerald-600",
];

const HOW_IT_WORKS = [
  { step: 1, icon: Search, title: "Search", desc: "Browse thousands of verified properties across India", color: "bg-indigo-500" },
  { step: 2, icon: MessageCircle, title: "Connect", desc: "Contact property owners directly — no middlemen", color: "bg-purple-500" },
  { step: 3, icon: Home, title: "Move In", desc: "Finalize the deal and move into your dream home", color: "bg-emerald-500" },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", role: "Home Buyer, Mumbai", avatar: "PS", text: "Found my dream apartment in just 3 days! No brokerage, direct owner deal. Absolutely amazing platform.", rating: 5 },
  { name: "Rahul Verma", role: "Tenant, Bangalore", avatar: "RV", text: "The verification system is top-notch. Every property I visited was exactly as described. Saved 2 months rent in brokerage!", rating: 5 },
  { name: "Anita Patel", role: "Property Owner, Delhi", avatar: "AP", text: "Rented out my property in 24 hours! The direct owner listing feature is a game-changer. Highly recommend.", rating: 5 },
  { name: "Vikram Singh", role: "Investor, Gurgaon", avatar: "VS", text: "Best platform for property investment research. Price trends and analytics helped me make informed decisions.", rating: 4 },
];



const formatProperty = (prop) => ({
  id: prop._id || prop.id,
  title: prop.title || "Premium Property",
  location: typeof prop.location === "object" ? `${prop.location.city || ""}, ${prop.location.state || ""}` : (prop.location || "Location not specified"),
  price: prop.price?.toLocaleString("en-IN") || "0",
  images: prop.images?.length ? prop.images : (prop.image ? [prop.image] : []),
  type: Array.isArray(prop.type) ? prop.type[0] : (prop.type || "residential"),
  purpose: Array.isArray(prop.purpose) ? prop.purpose.join(" & ") : (prop.purpose || "rent"),
  isNew: true,
  hasPrivateMedia: prop.images?.length > 1,
  bhk: prop.bhk,
  bathrooms: prop.bathrooms,
  area: prop.area,
  furnishing: prop.furnishing,
  postedBy: prop.postedBy,
  pricePerSqft: prop.pricePerSqft,
});
const PropertyCarousel = ({ type, typeProps }) => {
  const scrollRef = useRef(null);

  const displayProps = typeProps.slice(0, 10);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const containerWidth = scrollRef.current.clientWidth;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -containerWidth : containerWidth,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white capitalize flex items-center gap-2">
          Popular {type === 'pg-hostel' ? 'PGs & Hostels' : type === 'land' ? 'Land & Plots' : type === 'commercial' ? 'Commercial Spaces' : type + 's'}
        </h3>
        <div className="hidden sm:flex items-center gap-2">
          <button 
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 shadow-sm opacity-0 group-hover:opacity-100 disabled:opacity-0"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 shadow-sm opacity-0 group-hover:opacity-100 disabled:opacity-0"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex items-stretch gap-2.5 sm:gap-4 md:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
      >
        {displayProps.map((prop, i) => (
          <div 
            key={prop._id || i} 
            className="w-[calc(50vw-22px)] sm:w-[300px] shrink-0 snap-start flex flex-col"
          >
            <PropertyCard {...formatProperty(prop)} />
          </div>
        ))}

        {/* View All Card */}
        <div className="w-[calc(50vw-22px)] sm:w-[300px] shrink-0 snap-start flex flex-col">
          <Link 
             href={`/category/${type}`}
             className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-3 sm:p-4 group hover:border-indigo-500 dark:hover:border-indigo-500 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-center"
          >
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all shadow-sm mb-2 sm:mb-3">
              <ArrowRight size={18} className="sm:w-5 sm:h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-base">View All</h4>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 sm:mt-1">{typeProps.length > 10 ? `+${typeProps.length - 10} more` : `Explore all`}</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function HomeClient() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState({ district: "Hisar", area: "" });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const { data: propertiesRaw, isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const res = await axios.get("/properties");
      return res.data.properties;
    },
  });

  const { data: categoriesRaw, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axios.get("/categories");
      return Array.isArray(res.data) ? res.data : res.data?.data || res.data?.categories || [];
    },
  });

  const properties = propertiesRaw || [];
  const categories = categoriesRaw || [];

  const handleLocationSelect = (district, city, area) => {
    setSelectedLocation({ district, area: area || city });
    const q = new URLSearchParams({ city, address: area });
    router.push(`/featured-properties/1?${q.toString()}`);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#0c0a1d]">
      {/* Hero */}
      <HeroSlider />

      {/* Quick Category Grid */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="app-container">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Browse by Category</h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-2">Find properties based on your preference</p>
            </div>
            <Link href="/properties" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex-shrink-0">
              View All <ChevronRight size={16} />
            </Link>
          </div>

          {isCategoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 md:gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-4 flex flex-col items-center animate-pulse">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 mb-3" />
                  <div className="w-16 h-3.5 bg-slate-200 dark:bg-slate-700 rounded mb-1.5" />
                  <div className="w-12 h-2.5 bg-slate-100 dark:bg-slate-700/60 rounded" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/40">
              <p className="text-sm font-bold text-slate-400">No active categories found in catalog.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 md:gap-4">
              {categories.map((cat, idx) => {
                const palette = GRADIENT_PALETTES[idx % GRADIENT_PALETTES.length];
                const slug = cat.slug || cat.name?.toLowerCase().replace(/\s+/g, "-");

                return (
                  <Link
                    key={cat._id || slug}
                    href={`/category/${slug}`}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-3 sm:p-4 md:p-5 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${palette} flex items-center justify-center text-xl sm:text-2xl mb-2 sm:mb-3 shadow-lg text-white`}>
                      <span>{cat.icon || "🏠"}</span>
                    </div>
                    <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white mb-0.5 truncate w-full">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-400">
                      {cat.propertyCount !== undefined ? `${cat.propertyCount} properties` : "Explore listings"}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-4 text-center sm:hidden">
            <Link href="/properties" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
              View All Categories <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-12 sm:py-16 md:py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="app-container">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Featured Properties</h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-2">Hand-picked premium listings for you</p>
            </div>
            <Link href="/featured-properties/1" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex-shrink-0">
              View All <ChevronRight size={16} />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex gap-2.5 sm:gap-4 md:gap-6 overflow-x-auto pb-8 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 sm:mx-0 sm:px-0">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-[calc(50vw-22px)] sm:w-[300px] snap-start shrink-0">
                  <PropertySkeleton />
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <Building2 size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">No Properties Yet</h3>
              <p className="text-sm text-slate-500">Check back soon for new listings</p>
            </div>
          ) : (
            <div className="space-y-10 sm:space-y-14">
              {Object.entries(
                properties.reduce((acc, prop) => {
                  const type = Array.isArray(prop.type) ? prop.type[0] : (prop.type || "residential");
                  if (!acc[type]) acc[type] = [];
                  acc[type].push(prop);
                  return acc;
                }, {})
              ).map(([type, typeProps]) => (
                <PropertyCarousel key={type} type={type} typeProps={typeProps} />
              ))}
            </div>
          )}

          <div className="mt-8 sm:mt-12 text-center">
            <Link href="/featured-properties/1" className="btn-secondary inline-flex items-center gap-2 text-sm sm:text-base">
              Browse All Properties <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-8 sm:py-16 md:py-20">
        <div className="app-container">
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">How It Works</h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 max-w-xl mx-auto">Find your perfect property in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="text-center px-1 sm:px-4">
                <div className={`w-11 h-11 sm:w-16 sm:h-16 ${item.color} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-5 shadow-md relative`}>
                  <item.icon size={18} className="text-white sm:hidden" />
                  <item.icon size={24} className="text-white hidden sm:block" />
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-[9px] sm:text-xs font-bold text-slate-900 dark:text-white shadow-sm border border-slate-100 dark:border-slate-700">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-bold text-xs sm:text-lg text-slate-900 dark:text-white mb-0.5 sm:mb-2">{item.title}</h3>
                <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 leading-tight sm:leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="app-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            {[
              { value: "10K+", label: "Properties Listed", icon: Building2 },
              { value: "50K+", label: "Happy Users", icon: Users },
              { value: "95%", label: "Satisfaction Rate", icon: Star },
              { value: "24/7", label: "Customer Support", icon: Clock },
            ].map((stat, i) => (
              <div key={i} className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <stat.icon size={20} />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold">{stat.value}</p>
                <p className="text-[11px] sm:text-sm text-white/70 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Premium Commercial Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="app-container">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Premium Commercial</h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-2">High-value commercial properties and investment opportunities</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {[
              { title: "Office Spaces", icon: "fa-building", desc: "Prime locations with modern amenities", color: "from-blue-600 to-blue-700" },
              { title: "Retail Shops", icon: "fa-store", desc: "High-footfall areas for your business", color: "from-purple-600 to-purple-700" },
              { title: "Warehouses", icon: "fa-warehouse", desc: "Large spaces with excellent connectivity", color: "from-emerald-600 to-emerald-700" },
            ].map((item, i) => (
              <Link
                key={i}
                href="/category/commercial"
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-5 sm:p-6 group hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-lg sm:text-xl mb-3 sm:mb-4`}>
                  <i className={`fas ${item.icon}`} />
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3 sm:mb-4">{item.desc}</p>
                <span className="text-xs sm:text-sm font-semibold text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Explore <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="app-container">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">What Our Users Say</h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 max-w-xl mx-auto">Trusted by thousands of property seekers across India</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-4 sm:p-5">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">{t.name}</p>
                    <p className="text-[10px] sm:text-xs text-slate-400 truncate">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Trust Badges */}
      <section className="py-10 sm:py-12 bg-slate-50 dark:bg-slate-900/50">
        <div className="app-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: ShieldCheck, label: "Verified Properties", desc: "All listings are verified" },
              { icon: RefreshCw, label: "Direct Owner Deal", desc: "No middlemen, 0% brokerage" },
              { icon: Bell, label: "Price Alerts", desc: "Get notified on price drops" },
              { icon: Sparkles, label: "AI Recommendations", desc: "Smart property matching" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <item.icon size={18} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <LocationModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} onSelect={handleLocationSelect} />
    </main>
  );
}
