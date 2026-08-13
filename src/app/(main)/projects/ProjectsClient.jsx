"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { motion } from "framer-motion";
import { Building2, Home, MapPin, Phone, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function ProjectsClient() {
  const { data, isLoading } = useQuery({
    queryKey: ["projects-builders"],
    queryFn: async () => {
      const res = await axios.get("/properties", { params: { limit: 500 } });
      return res.data;
    },
  });

  const allProperties = data?.properties || [];
  const builders = useMemo(() => {
    const map = new Map();
    allProperties.forEach((p) => {
      const seller = p.sellerId;
      if (!seller || !seller._id) return;
      if (!map.has(seller._id)) {
        map.set(seller._id, {
          _id: seller._id,
          name: seller.name || "Property Owner",
          email: seller.email,
          profileImage: seller.profileImage,
          propertyCount: 0,
          cities: new Set(),
          properties: [],
        });
      }
      const entry = map.get(seller._id);
      entry.propertyCount++;
      entry.cities.add(p.location?.city || "Unknown");
      entry.properties.push(p._id);
    });
    return Array.from(map.values()).sort((a, b) => b.propertyCount - a.propertyCount);
  }, [allProperties]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="app-container pt-28 pb-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="app-container pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="section-title">Property Developers & Builders</h1>
          <p className="section-subtitle">Connect with trusted property owners and developers</p>
        </motion.div>

        {builders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 app-card border-dashed"
          >
            <Building2 size={40} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-white">No developers listed yet</h3>
            <p className="text-sm text-slate-500 mt-1">Check back soon for new property developers</p>
          </motion.div>
        ) : (
          <div className="app-grid">
            {builders.map((builder, i) => (
              <motion.div
                key={builder._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="app-card p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform flex-shrink-0">
                    {builder.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{builder.name}</h3>
                    <p className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                      <Home size={11} /> {builder.propertyCount} Properties
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin size={12} className="flex-shrink-0" />
                    <span className="truncate">{Array.from(builder.cities).slice(0, 3).join(", ")}</span>
                    {builder.cities.size > 3 && <span className="text-slate-400 flex-shrink-0">+{builder.cities.size - 3} more</span>}
                  </div>
                  {builder.email && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Mail size={12} className="flex-shrink-0" />
                      <span className="truncate">{builder.email}</span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/properties?seller=${builder._id}`}
                  className="block w-full btn-primary text-center text-xs py-2.5"
                >
                  View Properties
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 text-center p-6 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Are you a property developer?</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">List your projects and reach thousands of potential buyers directly</p>
          <Link href="/add" className="inline-flex btn-primary">
            List Your Properties
          </Link>
        </motion.div>
      </div>
      <Footer />
    </main>
  );
}
