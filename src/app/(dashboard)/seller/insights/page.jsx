"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Eye, DollarSign, MapPin, Award, Search, BarChart3, Home, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const LOCATIONS = [
  { area: "Downtown", density: 92, avgPrice: "₹45K", yourCount: 2 },
  { area: "Suburbs East", density: 78, avgPrice: "₹28K", yourCount: 4 },
  { area: "Westside", density: 65, avgPrice: "₹35K", yourCount: 1 },
  { area: "North Hills", density: 45, avgPrice: "₹52K", yourCount: 0 },
  { area: "South Side", density: 55, avgPrice: "₹22K", yourCount: 3 },
  { area: "Lakeside", density: 38, avgPrice: "₹60K", yourCount: 1 },
];

export default function SellerInsights() {
  const [selectedMonth, setSelectedMonth] = useState(MONTHS.length - 1);

  const { data: sellerStats } = useQuery({
    queryKey: ['seller-stats-insights'],
    queryFn: async () => {
      const response = await axios.get('/properties/seller-stats');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: propertiesData } = useQuery({
    queryKey: ['seller-properties-insights'],
    queryFn: async () => {
      const response = await axios.get('/properties/seller');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const properties = Array.isArray(propertiesData?.properties) ? propertiesData.properties :
    Array.isArray(propertiesData) ? propertiesData : [];
  const performanceData = sellerStats?.performanceData || [30, 45, 60, 50, 70, 55, 80, 65, 90, 75, 85, 95];

  const topProperty = [...properties].sort((a, b) => (b.views || 0) - (a.views || 0))[0];
  const totalViews = performanceData.reduce((a, b) => a + b, 0);
  const avgPrice = properties.length > 0
    ? Math.round(properties.reduce((s, p) => s + (p.price || 0), 0) / properties.length)
    : 0;
  const marketAvgPrice = 35000;

  const monthlyViews = performanceData.map((v, i) => ({
    month: MONTHS[i],
    views: v,
    isSelected: i === selectedMonth,
  }));

  const keywords = [
    { word: "affordable", score: 92, trend: "up" },
    { word: "balcony", score: 88, trend: "up" },
    { word: "parking", score: 85, trend: "stable" },
    { word: "furnished", score: 80, trend: "up" },
    { word: "pet friendly", score: 72, trend: "up" },
    { word: "gym", score: 68, trend: "stable" },
    { word: "corner unit", score: 62, trend: "down" },
    { word: "pool", score: 58, trend: "down" },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Market Insights</h2>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl">
          <TrendingUp size={14} /> +12.5% This Month
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 app-card p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Eye className="text-indigo-600" size={18} /> Monthly Views
          </h3>
          <div className="flex gap-1 mb-6">
            {MONTHS.map((m, i) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(i)}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                  i === selectedMonth
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="h-60 w-full flex items-end justify-between gap-3 px-2 pb-12 relative border-b border-l border-slate-100 dark:border-slate-700">
            {monthlyViews.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                <div className="w-full bg-indigo-100 dark:bg-white/5 rounded-t-xl relative transition-all duration-500" style={{ height: "100%" }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${item.views}%` }}
                    className={`absolute bottom-0 left-0 right-0 rounded-t-xl transition-colors ${
                      item.isSelected ? "bg-indigo-600 shadow-xl shadow-indigo-300/30" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase absolute -bottom-8">{item.month}</span>
                <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10">
                  {item.views} views
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {topProperty && (
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl text-white shadow-xl shadow-amber-200/30">
              <div className="flex items-center gap-2 text-amber-100 text-xs font-bold uppercase tracking-wider mb-2">
                <Award size={14} /> Top Performer
              </div>
              <h3 className="text-lg font-bold mb-1">{topProperty.title}</h3>
              <p className="text-amber-100 text-sm font-medium mb-4">{topProperty.location?.city || "N/A"}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-amber-200 text-[10px] font-bold uppercase tracking-wider">Views</p>
                  <p className="text-2xl font-bold">{topProperty.views || 0}</p>
                </div>
                <div>
                  <p className="text-amber-200 text-[10px] font-bold uppercase tracking-wider">Price</p>
                  <p className="text-2xl font-bold">₹{(topProperty.price || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          <div className="app-card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <DollarSign className="text-emerald-500" size={18} /> Price Comparison
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-slate-500">Your Avg Price</span>
                  <span className="text-slate-900 dark:text-white">₹{avgPrice.toLocaleString()}</span>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((avgPrice / marketAvgPrice) * 100, 100)}%` }}
                    className="h-full bg-indigo-600 rounded-full"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-slate-500">Market Avg Price</span>
                  <span className="text-slate-900 dark:text-white">₹{marketAvgPrice.toLocaleString()}</span>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-slate-300 dark:bg-slate-700 rounded-full" />
                </div>
              </div>
              <div className="pt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
                <ArrowUp size={14} /> Your prices are {avgPrice > marketAvgPrice ? "above" : "below"} market average
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="app-card p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <MapPin className="text-rose-500" size={18} /> Location Heatmap
          </h3>
          <div className="space-y-3">
            {LOCATIONS.map((loc) => (
              <div key={loc.area} className="flex items-center gap-4">
                <span className="w-20 text-sm font-semibold text-slate-700 dark:text-slate-300 flex-shrink-0">{loc.area}</span>
                <div className="flex-1 h-7 bg-slate-100 dark:bg-white/5 rounded-xl overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${loc.density}%` }}
                    className={`h-full rounded-xl ${
                      loc.density > 75 ? "bg-rose-500" : loc.density > 55 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  />
                  <div className="absolute inset-0 flex items-center px-3">
                    <div className="flex items-center justify-between w-full text-[10px] font-bold text-white">
                      <span>{loc.avgPrice}</span>
                      <span>{loc.yourCount} listing{loc.yourCount !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="app-card p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Search className="text-indigo-500" size={18} /> Keywords That Drive Views
          </h3>
          <div className="space-y-3">
            {keywords.map((kw) => (
              <div key={kw.word} className="flex items-center gap-4">
                <span className="w-24 text-sm font-semibold text-slate-900 dark:text-white capitalize truncate">{kw.word}</span>
                <div className="flex-1 h-7 bg-slate-100 dark:bg-white/5 rounded-xl overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${kw.score}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl"
                  />
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-[10px] font-bold text-white drop-shadow-md">{kw.score}% relevance</span>
                  </div>
                </div>
                <span className="flex-shrink-0">
                  {kw.trend === "up" ? (
                    <ArrowUp size={14} className="text-emerald-500" />
                  ) : kw.trend === "down" ? (
                    <ArrowDown size={14} className="text-rose-500" />
                  ) : (
                    <Minus size={14} className="text-slate-400" />
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-500/5 rounded-xl border border-indigo-100 dark:border-indigo-500/10">
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <BarChart3 size={14} /> Pro Tip
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Properties with &ldquo;affordable&rdquo;, &ldquo;balcony&rdquo;, and &ldquo;parking&rdquo; in the title get 40% more views.
              Add these to your listing descriptions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
