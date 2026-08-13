"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import HeroSlider from "@/components/HeroSlider";
import PropertyCard from "@/components/PropertyCard";
import LocationModal from "@/components/LocationModal";
import {
  Search, ChevronRight, ShieldCheck, Users, TrendingUp,
  Building2, Home, MapPin, Star, Clock, ArrowRight,
  Sparkles, Smartphone, MessageCircle, Bell, RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import PropertySkeleton from "@/components/PropertySkeleton";
import { useSelector } from "react-redux";

const QUICK_CATEGORIES = [
  { id: "residential", label: "Apartments", icon: "🏢", desc: "2,450+ properties", color: "from-blue-500 to-blue-600" },
  { id: "commercial", label: "Commercial", icon: "🏢", desc: "890+ properties", color: "from-purple-500 to-purple-600" },
  { id: "land", label: "Land/Plots", icon: "🌳", desc: "340+ properties", color: "from-emerald-500 to-emerald-600" },
  { id: "pg-hostel", label: "PG/Hostel", icon: "🏘️", desc: "560+ properties", color: "from-amber-500 to-amber-600" },
  { id: "industrial", label: "Industrial", icon: "🏭", desc: "120+ properties", color: "from-rose-500 to-rose-600" },
  { id: "short-term", label: "Short-Term", icon: "📅", desc: "780+ properties", color: "from-cyan-500 to-cyan-600" },
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

const CITIES = [
  { name: "Mumbai", image: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=400&q=80", count: "2,450+" },
  { name: "Delhi", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80", count: "1,890+" },
  { name: "Bangalore", image: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=400&q=80", count: "3,120+" },
  { name: "Pune", image: "https://images.unsplash.com/photo-1624969862644-791f3dc98927?auto=format&fit=crop&w=400&q=80", count: "1,560+" },
  { name: "Hyderabad", image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=400&q=80", count: "1,230+" },
  { name: "Chennai", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80", count: "980+" },
];

const formatProperty = (prop) => ({
  id: prop._id || prop.id,
  title: prop.title || "Premium Property",
  location: typeof prop.location === "object" ? `${prop.location.city || ""}, ${prop.location.state || ""}` : (prop.location || "Location not specified"),
  price: prop.price?.toLocaleString("en-IN") || "0",
  images: prop.images?.length ? prop.images : [prop.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"],
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

  const properties = propertiesRaw || [];

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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 md:gap-4">
            {QUICK_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/search?type=${cat.id}`}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-3 sm:p-4 md:p-5 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-xl sm:text-2xl mb-2 sm:mb-3 shadow-lg`}>
                  <span>{cat.icon}</span>
                </div>
                <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white mb-0.5">{cat.label}</h3>
                <p className="text-[10px] sm:text-xs text-slate-400">{cat.desc}</p>
              </Link>
            ))}
          </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => <PropertySkeleton key={i} />)}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <Building2 size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">No Properties Yet</h3>
              <p className="text-sm text-slate-500">Check back soon for new listings</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {properties.slice(0, 8).map((prop, i) => (
                <PropertyCard key={prop._id || i} {...formatProperty(prop)} />
              ))}
            </div>
          )}

          <div className="mt-6 sm:mt-8 text-center">
            <Link href="/featured-properties/1" className="btn-secondary inline-flex items-center gap-2 text-sm sm:text-base">
              Browse All Properties <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="app-container">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">How It Works</h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 max-w-xl mx-auto">Find your perfect property in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="text-center px-4">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-lg relative`}>
                  <item.icon size={24} className="text-white" />
                  <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-slate-900 dark:text-white shadow-sm border border-slate-100 dark:border-slate-700">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white mb-1 sm:mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
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

      {/* Popular Cities */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="app-container">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Popular Cities</h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-2">Discover properties in India&apos;s top metros</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {CITIES.map((city) => (
              <Link
                key={city.name}
                href={`/search?city=${city.name.toLowerCase()}`}
                className="relative group rounded-2xl overflow-hidden aspect-[4/3]"
              >
                <Image
                  src={city.image}
                  alt={city.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 16vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <h3 className="text-white font-bold text-xs sm:text-sm">{city.name}</h3>
                  <p className="text-white/70 text-[10px] sm:text-xs">{city.count} properties</p>
                </div>
              </Link>
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

      {/* Download App CTA */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="app-container relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="text-white max-w-xl text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">Get the RentzyPro App</h2>
              <p className="text-white/80 text-sm sm:text-base md:text-lg mb-5 sm:mb-6">
                Find properties on the go! Get instant notifications, save your favorites, and chat with owners directly.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2.5 sm:gap-3">
                <button className="flex items-center gap-2.5 sm:gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 transition-all">
                  <i className="fab fa-apple text-xl sm:text-2xl" />
                  <div className="text-left">
                    <p className="text-[9px] sm:text-[10px] text-white/70">Download on</p>
                    <p className="text-sm sm:text-base font-semibold">App Store</p>
                  </div>
                </button>
                <button className="flex items-center gap-2.5 sm:gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 transition-all">
                  <i className="fab fa-google-play text-xl sm:text-2xl" />
                  <div className="text-left">
                    <p className="text-[9px] sm:text-[10px] text-white/70">Get it on</p>
                    <p className="text-sm sm:text-base font-semibold">Google Play</p>
                  </div>
                </button>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="w-44 sm:w-48 h-64 sm:h-72 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 flex items-center justify-center">
                <Smartphone size={56} className="text-white/30" />
              </div>
              <div className="w-44 sm:w-48 h-64 sm:h-72 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 -translate-y-4 flex items-center justify-center">
                <Smartphone size={56} className="text-white/30" />
              </div>
            </div>
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
