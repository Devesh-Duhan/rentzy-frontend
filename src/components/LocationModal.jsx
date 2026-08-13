"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Navigation, X, Building2, Map, CheckCircle2, ChevronRight } from "lucide-react";

const POPULAR_CITIES = [
  { name: "Hisar", district: "Hisar", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  { name: "Hansi", district: "Hisar", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { name: "Rohtak", district: "Rohtak", color: "bg-rose-50 text-rose-600 border-rose-100" },
  { name: "Bhiwani", district: "Bhiwani", color: "bg-amber-50 text-amber-600 border-amber-100" },
  { name: "Gurgaon", district: "Gurgaon", color: "bg-purple-50 text-purple-600 border-purple-100" },
  { name: "Chandigarh", district: "Chandigarh", color: "bg-blue-50 text-blue-600 border-blue-100" },
];

const LocationModal = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLocating, setIsLocating] = useState(false);

  // Flattened data for search
  const allLocations = [
    { name: "Sector 14", city: "Hisar", type: "Area" },
    { name: "Model Town", city: "Hisar", type: "Area" },
    { name: "Urban Estate", city: "Hisar", type: "Area" },
    { name: "PLA", city: "Hisar", type: "Area" },
    { name: "Azad Nagar", city: "Hisar", type: "Area" },
    { name: "Sector 13", city: "Hisar", type: "Area" },
    { name: "Hisar City", city: "Hisar", type: "City" },
    { name: "Hansi", city: "Hisar", type: "City" },
    { name: "Barwala", city: "Hisar", type: "City" },
    { name: "Adampur", city: "Hisar", type: "City" },
    { name: "Rohtak City", city: "Rohtak", type: "City" },
    { name: "Model Town Rohtak", city: "Rohtak", type: "Area" },
  ];

  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      const filtered = allLocations.filter(loc => 
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        loc.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, use reverse geocoding here
          // For now, let's simulate a find
          setTimeout(() => {
            onSelect("Hisar", "Hisar City", "Model Town");
            setIsLocating(false);
          }, 1500);
        },
        () => setIsLocating(false)
      );
    } else {
      setIsLocating(false);
    }
  };

  const selectLocation = (loc) => {
    if (loc.type === "City") {
      onSelect(loc.city, loc.name, "");
    } else {
      onSelect(loc.city, loc.city, loc.name);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-white dark:border-white/5"
        >
          {/* Header */}
          <div className="p-8 pb-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Find Your Location</h2>
                <p className="text-slate-500 font-bold mt-1">Search for cities, districts, or specific sectors</p>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <Search size={22} />
              </div>
              <input 
                type="text"
                placeholder="Where do you want to live?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-32 py-6 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-500 rounded-3xl outline-none text-lg font-black text-slate-900 dark:text-white placeholder:text-slate-400 transition-all shadow-inner"
              />
              <button 
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
              >
                {isLocating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Navigation size={14} />
                )}
                <span>Auto</span>
              </button>
            </div>
          </div>

          <div className="p-8 pt-4 overflow-y-auto max-h-[500px] custom-scrollbar">
            {searchTerm.length > 1 ? (
              <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-2">Search Results</h3>
                {suggestions.length > 0 ? suggestions.map((loc, i) => (
                  <button
                    key={i}
                    onClick={() => selectLocation(loc)}
                    className="w-full flex items-center justify-between p-5 bg-white dark:bg-white/2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 transition-all group-hover:bg-indigo-600 group-hover:text-white">
                        {loc.type === "City" ? <Building2 size={20} /> : <MapPin size={20} />}
                      </div>
                      <div className="text-left">
                        <p className="text-base font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{loc.name}</p>
                        <p className="text-xs font-bold text-slate-400 lowercase">{loc.type} · {loc.city}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </button>
                )) : (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                      <Search size={32} />
                    </div>
                    <p className="text-slate-500 font-bold">No locations matching "{searchTerm}"</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-10">
                {/* Popular Cities */}
                <div>
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Popular Cities
                   </h3>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                     {POPULAR_CITIES.map((city) => (
                       <button
                         key={city.name}
                         onClick={() => onSelect(city.district, city.name, "")}
                         className={`p-6 rounded-3xl border text-center transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 group ${city.color}`}
                       >
                         <div className="w-12 h-12 bg-white/50 dark:bg-white/1 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                           <Building2 size={24} />
                         </div>
                         <p className="font-black text-sm tracking-tight">{city.name}</p>
                         <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mt-1">{city.district}</p>
                       </button>
                     ))}
                   </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                        <CheckCircle2 size={18} />
                      </div>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Verified locations across Haryana</p>
                   </div>
                   <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                        <Map size={18} />
                      </div>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Direct from owner listings only</p>
                   </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LocationModal;
