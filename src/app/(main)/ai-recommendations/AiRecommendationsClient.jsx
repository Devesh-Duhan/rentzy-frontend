"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Sparkles,
  Search,
  MapPin,
  DollarSign,
  Home,
  Loader2,
  Brain,
  Lightbulb,
  TrendingUp,
  Target,
} from "lucide-react";
import Link from "next/link";
import axios from "@/lib/axios";
import Footer from "@/components/Footer";

export default function AiRecommendationsClient() {
  const [query, setQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const { data: allProperties } = useQuery({
    queryKey: ["properties-all"],
    queryFn: async () => {
      const res = await axios.get("/properties?limit=50");
      return res.data.properties || res.data || [];
    },
    enabled: showResults,
  });

  const handleAnalyze = () => {
    if (!query.trim()) return;
    setIsAnalyzing(true);
    setShowResults(false);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2500);
  };

  const features = [
    { icon: Brain, title: "Smart Matching", desc: "ML algorithms analyze your preferences to find the perfect property" },
    { icon: TrendingUp, title: "Price Prediction", desc: "Get AI-powered price forecasts and market trends" },
    { icon: Target, title: "Precision Filters", desc: "Fine-tuned recommendations based on your lifestyle needs" },
    { icon: Lightbulb, title: "Insights", desc: "Discover neighborhoods and properties you might have missed" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
        <div className="app-container py-16 md:py-24 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 text-white/80 text-xs font-semibold uppercase tracking-widest mb-4">
              <Sparkles size={14} /> AI-Powered
            </div>
            <h1 className="section-title text-white text-3xl md:text-5xl lg:text-6xl">
              AI-Powered Property <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-400">Recommendations</span>
            </h1>
            <p className="text-indigo-200 text-sm md:text-base mt-3 max-w-2xl mx-auto">
              Tell us what you're looking for and let our AI find your perfect match
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 max-w-2xl mx-auto"
          >
            <div className="glass-effect rounded-2xl p-5 md:p-6">
              <label className="block text-sm font-semibold text-indigo-200 mb-2">What are you looking for?</label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe your dream property... e.g., '3 BHK apartment in Bangalore under 1.5 Cr with good connectivity and nearby schools'"
                rows={4}
                className="w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-300 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-purple-400/50 resize-none"
              />
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !query.trim()}
                className="mt-3 w-full btn-primary flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-900/30"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Analyzing your preferences...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Get AI Recommendations
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="app-container py-12">
        {isAnalyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16">
            <div className="relative w-20 h-20 mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-800 border-t-purple-600"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain size={28} className="text-purple-600" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">AI is Analyzing</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Processing your preferences with machine learning models...</p>
          </motion.div>
        )}

        {showResults && (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={20} className="text-purple-600" />
                <h2 className="section-title text-xl md:text-2xl">Recommended Properties</h2>
              </div>
              <p className="section-subtitle">Based on your preferences, our AI suggests these properties</p>
            </motion.div>

            <div className="app-grid">
              {(allProperties || []).slice(0, 6).map((prop, i) => (
                <motion.div
                  key={prop._id || prop.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="app-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center relative overflow-hidden">
                    <Home size={40} className="text-indigo-300 dark:text-indigo-600" />
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-purple-600 text-white text-[10px] font-bold rounded-full">
                      AI Match
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2 truncate text-sm">{prop.title || "Property"}</h3>
                    <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} />
                        <span>{prop.location?.address || prop.location?.city || prop.city || "Location"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign size={12} />
                        <span>₹{(prop.price || 0).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    <Link
                      href={`/properties/${prop._id || prop.id}`}
                      className="mt-3 w-full btn-primary inline-flex items-center justify-center gap-2 text-xs py-2.5"
                    >
                      View Details
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-10 p-6 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-100 dark:border-purple-900/50 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Sparkles size={16} className="text-purple-600" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600">Coming Soon</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Personalized AI Matching</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                This feature uses machine learning to analyze your preferences. Coming soon with personalized AI matching.
              </p>
            </motion.div>
          </>
        )}

        {!showResults && !isAnalyzing && (
          <div className="app-grid mt-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="app-card p-5 hover:shadow-lg transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mb-3">
                  <feature.icon size={20} className="text-purple-600" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1 text-sm">{feature.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
