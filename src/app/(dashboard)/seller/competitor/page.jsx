"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Eye,
  DollarSign,
  Home,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Building2,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

const PROPERTY_TYPES = ["apartment", "villa", "house", "commercial", "shop", "plot", "penthouse"];

export default function SellerCompetitor() {
  const { data: propertiesData, isLoading } = useQuery({
    queryKey: ["seller-properties-competitor"],
    queryFn: async () => {
      const res = await axios.get("/properties/seller");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: allPropertiesData } = useQuery({
    queryKey: ["all-properties-competitor"],
    queryFn: async () => {
      const res = await axios.get("/properties", { params: { limit: 200 } });
      return res.data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const myProperties = useMemo(() => {
    const data = Array.isArray(propertiesData?.properties) ? propertiesData.properties : Array.isArray(propertiesData) ? propertiesData : [];
    return data;
  }, [propertiesData]);

  const allProperties = useMemo(() => {
    const data = allPropertiesData?.properties || allPropertiesData || [];
    return Array.isArray(data) ? data : [];
  }, [allPropertiesData]);

  const myCity = myProperties[0]?.location?.city || "";

  const marketProperties = useMemo(() => {
    if (!myCity) return [];
    return allProperties.filter((p) => p.location?.city === myCity);
  }, [allProperties, myCity]);

  const myAvgPrice = useMemo(() => {
    if (myProperties.length === 0) return 0;
    const total = myProperties.reduce((s, p) => s + (p.price || 0), 0);
    return Math.round(total / myProperties.length);
  }, [myProperties]);

  const marketAvgPrice = useMemo(() => {
    if (marketProperties.length === 0) return 0;
    const total = marketProperties.reduce((s, p) => s + (p.price || 0), 0);
    return Math.round(total / marketProperties.length);
  }, [marketProperties]);

  const myAvgViews = useMemo(() => {
    if (myProperties.length === 0) return 0;
    const total = myProperties.reduce((s, p) => s + (p.views || 0), 0);
    return Math.round(total / myProperties.length);
  }, [myProperties]);

  const marketAvgViews = useMemo(() => {
    if (marketProperties.length === 0) return 0;
    const total = marketProperties.reduce((s, p) => s + (p.views || 0), 0);
    return Math.round(total / marketProperties.length);
  }, [marketProperties]);

  const typeDistribution = useMemo(() => {
    const myCounts = {};
    const marketCounts = {};
    PROPERTY_TYPES.forEach((t) => { myCounts[t] = 0; marketCounts[t] = 0; });
    myProperties.forEach((p) => {
      const t = Array.isArray(p.type) ? p.type[0] : p.type;
      if (t && myCounts[t] !== undefined) myCounts[t]++;
    });
    marketProperties.forEach((p) => {
      const t = Array.isArray(p.type) ? p.type[0] : p.type;
      if (t && marketCounts[t] !== undefined) marketCounts[t]++;
    });
    return PROPERTY_TYPES.map((t) => ({
      type: t,
      myCount: myCounts[t],
      marketCount: marketCounts[t],
      maxCount: Math.max(myCounts[t], marketCounts[t], 1),
    }));
  }, [myProperties, marketProperties]);

  const tips = useMemo(() => {
    const t = [];
    if (myAvgPrice > marketAvgPrice && marketAvgPrice > 0) {
      t.push("Your average price is above market average. Consider highlighting premium features to justify pricing.");
    } else if (myAvgPrice < marketAvgPrice && myAvgPrice > 0) {
      t.push("Your prices are below market average. You may be able to increase rates competitively.");
    }
    if (myAvgViews < marketAvgViews) {
      t.push("Your properties get fewer views than market average. Try improving photos and descriptions.");
    } else if (myAvgViews > marketAvgViews) {
      t.push("Your listings are performing well above average in views!");
    }
    if (myProperties.length === 0) {
      t.push("List more properties to increase market presence.");
    } else if (myProperties.length < 3) {
      t.push("Consider adding more properties to strengthen your market position.");
    }
    if (t.length === 0) {
      t.push("You're well positioned in the market. Keep up the great work!");
    }
    return t;
  }, [myAvgPrice, marketAvgPrice, myAvgViews, marketAvgViews, myProperties.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Competitor Analysis</h2>
        {myCity && (
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-xl">
            <Building2 size={14} /> Market: {myCity}
          </div>
        )}
      </div>

      {myProperties.length === 0 ? (
        <div className="text-center py-16 app-card">
          <Home className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-white">No properties listed</h3>
          <p className="section-subtitle text-sm mt-2">Add properties first to see how you compare with the market.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="app-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-indigo-600" size={22} />
                </div>
                <h3 className="font-bold">Price Comparison</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-500">Your Avg Price</span>
                    <span className="text-slate-900 dark:text-white">₹{myAvgPrice.toLocaleString()}</span>
                  </div>
                  <div className="h-3.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${marketAvgPrice > 0 ? Math.min((myAvgPrice / marketAvgPrice) * 100, 100) : 0}%` }}
                      className="h-full bg-indigo-600 rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-500">Market Avg Price</span>
                    <span className="text-slate-900 dark:text-white">₹{marketAvgPrice.toLocaleString()}</span>
                  </div>
                  <div className="h-3.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-slate-300 dark:bg-slate-700 rounded-full" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold">
                  {myAvgPrice > marketAvgPrice && marketAvgPrice > 0 ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <ArrowUp size={14} /> {Math.round(((myAvgPrice - marketAvgPrice) / marketAvgPrice) * 100)}% above market
                    </span>
                  ) : myAvgPrice < marketAvgPrice && myAvgPrice > 0 ? (
                    <span className="text-amber-600 flex items-center gap-1">
                      <ArrowDown size={14} /> {Math.round(((marketAvgPrice - myAvgPrice) / marketAvgPrice) * 100)}% below market
                    </span>
                  ) : (
                    <span className="text-slate-400">At market average</span>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="app-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <Eye className="text-emerald-600" size={22} />
                </div>
                <h3 className="font-bold">Views Comparison</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-500">Your Avg Views</span>
                    <span className="text-slate-900 dark:text-white">{myAvgViews}</span>
                  </div>
                  <div className="h-3.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${marketAvgViews > 0 ? Math.min((myAvgViews / marketAvgViews) * 100, 100) : 0}%` }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-500">Market Avg Views</span>
                    <span className="text-slate-900 dark:text-white">{marketAvgViews}</span>
                  </div>
                  <div className="h-3.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-slate-300 dark:bg-slate-700 rounded-full" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold">
                  {myAvgViews > marketAvgViews && marketAvgViews > 0 ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <ArrowUp size={14} /> {Math.round(((myAvgViews - marketAvgViews) / marketAvgViews) * 100)}% above market
                    </span>
                  ) : myAvgViews < marketAvgViews && myAvgViews > 0 ? (
                    <span className="text-amber-600 flex items-center gap-1">
                      <ArrowDown size={14} /> {Math.round(((marketAvgViews - myAvgViews) / marketAvgViews) * 100)}% below market
                    </span>
                  ) : (
                    <span className="text-slate-400">At market average</span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="app-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center">
                <BarChart3 className="text-amber-600" size={22} />
              </div>
              <h3 className="font-bold">Property Type Distribution</h3>
            </div>
            <div className="space-y-4">
              {typeDistribution.map((item) => (
                <div key={item.type}>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-700 dark:text-slate-300 capitalize w-24">{item.type}</span>
                    <span className="text-slate-400 text-xs">You: {item.myCount} | Market: {item.marketCount}</span>
                  </div>
                  <div className="h-5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden relative">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(item.myCount / item.maxCount) * 100}%` }} className="h-full bg-indigo-500 rounded-full absolute top-0 left-0 opacity-80" />
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(item.marketCount / item.maxCount) * 100}%` }} className="h-full bg-slate-300 dark:bg-slate-700 rounded-full absolute top-0 left-0 opacity-50" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-indigo-500" /> Your Properties</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-slate-300 dark:bg-slate-700" /> Market</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-indigo-50 dark:bg-indigo-950/30 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                <Lightbulb className="text-indigo-600" size={22} />
              </div>
              <h3 className="font-bold">How You Compare</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-500/10">
                  <TrendingUp className="text-indigo-600 mt-0.5 flex-shrink-0" size={16} />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{tip}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
