"use client";

import filterUiStyles from "@/components/filters/Filters.module.css";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search,
  ShieldCheck,
  FileText,
  Building2,
  MapPin,
  Calendar,
  CheckCircle,
  X,
  Scale,
  Award,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import axios from "@/lib/axios";
import Footer from "@/components/Footer";

export default function ReraClient() {
  const [searchRera, setSearchRera] = useState("");

  const { data: reraProperties, isLoading } = useQuery({
    queryKey: ["rera-properties"],
    queryFn: async () => {
      // Public, read-only endpoint - no auth required.
      const res = await axios.get("/property-documents/public?type=rera_certificate&limit=50");
      const documents = res.data?.documents || res.data || [];
      return documents
        .map((doc) => {
          const property = doc.property || {};
          return {
            ...property,
            _id: property._id || doc._id,
            reraNumber: property.reraNumber || property.reraRegNumber || null,
            projectName: property.title || doc.title,
            documentUrl: doc.fileUrl,
            isVerified: doc.isVerified,
          };
        })
        // Never invent a RERA number - only show what is actually on record
        .filter((p) => p.reraNumber);
    },
  });

  const filtered = useMemo(() => {
    if (!reraProperties || !Array.isArray(reraProperties)) return [];
    if (!searchRera.trim()) return reraProperties;
    return reraProperties.filter(
      (p) =>
        (p.reraNumber || "").toLowerCase().includes(searchRera.toLowerCase()) ||
        (p.title || "").toLowerCase().includes(searchRera.toLowerCase()) ||
        (p.projectName || "").toLowerCase().includes(searchRera.toLowerCase())
    );
  }, [reraProperties, searchRera]);

  const reraInfoCards = [
    { icon: ShieldCheck, title: "Project Transparency", desc: "Developers must disclose all project details, approvals, and timelines" },
    { icon: Scale, title: "Buyer Protection", desc: "Legal framework protects homebuyers from delays and fraudulent practices" },
    { icon: Award, title: "Registered Projects", desc: "Only RERA registered projects can advertise and sell properties" },
    { icon: BookOpen, title: "Regular Updates", desc: "Developers must provide quarterly updates on project progress" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-900 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
        <div className="app-container py-20 md:py-32 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest mb-6">
              <ShieldCheck size={14} /> RERA Compliance
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter mb-4">
              RERA Registered <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-400">Properties</span>
            </h1>
            <p className="text-lg md:text-xl text-emerald-200 font-medium max-w-2xl mx-auto">
              RERA registration ensures project transparency and buyer protection
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 max-w-xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by RERA number or project name..."
                value={searchRera}
                onChange={(e) => setSearchRera(e.target.value)}
                className={"w-full pl-12 pr-10 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-emerald-300 outline-none focus:ring-2 focus:ring-emerald-400/50 text-sm font-bold" + " " + filterUiStyles.filterControl}
              />
              {searchRera && (
                <button onClick={() => setSearchRera("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                  <X size={18} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="app-container py-16">
        <div className="app-grid mb-16">
          {reraInfoCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="app-card p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <card.icon size={24} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{card.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        {isLoading ? (
          <div className="app-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="app-card p-6 animate-pulse">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-1/2 mb-2" />
                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-2/3 mb-4" />
                <div className="h-10 bg-slate-100 dark:bg-slate-700 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck size={36} className="text-emerald-400" />
            </div>
            <h2 className="section-title text-2xl mb-3">No RERA Properties Found</h2>
            <p className="section-subtitle max-w-md mb-6">
              {searchRera ? "No properties match your search. Try a different RERA number." : "RERA integration coming soon for all Indian properties."}
            </p>
          </motion.div>
        ) : (
          <div className="app-grid">
            {filtered.map((prop, i) => (
              <motion.div
                key={prop._id || prop.id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="app-card p-6"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <FileText size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{prop.title || prop.projectName || "Property"}</h3>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      <CheckCircle size={12} className="inline mr-1" />
                      RERA Registered
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} />
                    <span className="font-mono text-xs">{prop.reraNumber || "RERA Pending"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>{prop.location?.city || prop.city || "Location"}</span>
                  </div>
                  {prop.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>Registered: {new Date(prop.createdAt).toLocaleDateString("en-IN")}</span>
                    </div>
                  )}
                </div>
                <Link
                  href={`/properties/${prop._id || prop.id}`}
                  className="btn-primary mt-4 w-full flex items-center justify-center gap-2"
                >
                  View Property
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 p-8 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-3xl border border-emerald-100 dark:border-emerald-900/50 text-center">
          <ShieldCheck size={32} className="mx-auto mb-3 text-emerald-600" />
          <h3 className="section-title text-xl mb-2">RERA Integration</h3>
          <p className="section-subtitle max-w-xl mx-auto">
            RERA registration ensures project transparency and buyer protection. RERA integration coming soon for all Indian properties.
          </p>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}