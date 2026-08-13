"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  X,
  MapPin,
  DollarSign,
  Eye,
  Monitor,
  Rotate3d,
  Globe,
  Building2,
} from "lucide-react";
import Link from "next/link";
import axios from "@/lib/axios";
import Footer from "@/components/Footer";

export default function VirtualToursClient() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const { data: videoProperties, isLoading } = useQuery({
    queryKey: ["property-videos"],
    queryFn: async () => {
      try {
        const res = await axios.get("/property-videos");
        return res.data.videos || res.data || [];
      } catch {
        const res = await axios.get("/properties?limit=20");
        const props = res.data.properties || res.data || [];
        return props.filter((p) => p.video || p.videoUrl || p.virtualTour);
      }
    },
  });

  const features = [
    { icon: Monitor, title: "360° Views", desc: "Explore every angle of the property from your device" },
    { icon: Rotate3d, title: "3D Walkthroughs", desc: "Immersive 3D tours that feel like being there" },
    { icon: Globe, title: "From Anywhere", desc: "Tour properties remotely, anytime, anywhere" },
    { icon: Building2, title: "All Properties", desc: "Virtual tours coming for all listed properties" },
  ];

  const placeholderVideos = [
    { _id: "demo1", title: "Modern 3BHK Apartment", location: "Bangalore", price: 8500000, thumbnail: null },
    { _id: "demo2", title: "Luxury Villa with Pool", location: "Goa", price: 25000000, thumbnail: null },
    { _id: "demo3", title: "Commercial Office Space", location: "Mumbai", price: 15000000, thumbnail: null },
  ];

  const displayProperties = (videoProperties && videoProperties.length > 0) ? videoProperties : placeholderVideos;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
        <div className="app-container py-16 md:py-24 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 text-white/80 text-xs font-semibold uppercase tracking-widest mb-4">
              <Eye size={14} /> Virtual Tours
            </div>
            <h1 className="section-title text-white text-3xl md:text-5xl lg:text-6xl">
              Virtual Property <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">Tours</span>
            </h1>
            <p className="text-indigo-200 text-sm md:text-base mt-3 max-w-2xl mx-auto">
              Explore properties from the comfort of your home with immersive 3D virtual tours
            </p>
          </motion.div>
        </div>
      </div>

      <div className="app-container py-12">
        {videoProperties && videoProperties.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 p-6 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/50 text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full blur-2xl opacity-30 animate-pulse" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                <Rotate3d size={32} className="text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">3D Virtual Tours Demo</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-1">
              Virtual tours coming soon for all properties. Currently available for select listings.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Here's a preview of what's coming</p>
          </motion.div>
        )}

        {videoProperties && videoProperties.length > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 text-sm font-medium text-slate-500 dark:text-slate-400 text-center">
            Virtual tours coming soon for all properties. Currently available for select listings.
          </motion.p>
        )}

        <div className="app-grid">
          {displayProperties.map((prop, i) => (
            <motion.div
              key={prop._id || prop.id || i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="app-card overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="relative h-44 bg-gradient-to-br from-slate-200 to-indigo-200 dark:from-slate-700 dark:to-indigo-900/50 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform cursor-pointer" onClick={() => setSelectedVideo(prop)}>
                    <Play size={24} className="text-indigo-600 ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 z-20">
                  <span className="px-2.5 py-1 bg-white/90 dark:bg-slate-800/90 text-[10px] font-bold rounded-full text-slate-700 dark:text-slate-300">
                    Virtual Tour
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 truncate text-sm">{prop.title || "Property"}</h3>
                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} />
                    <span>{prop.location?.city || prop.city || "Location"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign size={12} />
                    <span>₹{(prop.price || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVideo(prop)}
                  className="mt-3 w-full btn-primary inline-flex items-center justify-center gap-2 text-xs py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                >
                  <Play size={14} /> Watch Virtual Tour
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="app-grid mt-12">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="app-card p-5 hover:shadow-lg transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center mb-3">
                <feature.icon size={20} className="text-cyan-600" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1 text-sm">{feature.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-slate-900 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <h3 className="text-white font-bold truncate mr-4 text-sm">{selectedVideo.title || "Virtual Tour"}</h3>
                <button onClick={() => setSelectedVideo(null)} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700 transition-all">
                  <X size={16} />
                </button>
              </div>
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Play size={32} className="text-white ml-1" />
                  </div>
                  <p className="text-slate-400 font-medium text-sm">Virtual Tour Player Coming Soon</p>
                  <p className="text-slate-500 text-xs mt-1">360° video playback will be available here</p>
                </div>
              </div>
              <div className="p-4 bg-slate-800/50">
                <p className="text-slate-400 text-xs">
                  <span className="font-bold text-white">{selectedVideo.title}</span> — {selectedVideo.location?.city || selectedVideo.city || ""} ₹{(selectedVideo.price || 0).toLocaleString("en-IN")}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
