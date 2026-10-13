"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { motion } from "framer-motion";
import {
  Trash2,
  Plus,
  Search,
  X,
  ArrowUpDown,
  Check,
  Home,
  Building2,
  MapPin,
  Calendar,
  IndianRupee,
  Bath,
  Bed,
  Maximize2,
  ShieldCheck,
  Tags,
  AlertCircle,
  ExternalLink,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import Footer from "@/components/Footer";

const ROWS = [
  { key: "image", label: "Image" },
  { key: "title", label: "Title" },
  { key: "price", label: "Price" },
  { key: "purpose", label: "Purpose" },
  { key: "type", label: "Type" },
  { key: "bedrooms", label: "Bedrooms" },
  { key: "bathrooms", label: "Bathrooms" },
  { key: "area", label: "Area (sqft)" },
  { key: "deposit", label: "Deposit" },
  { key: "amenities", label: "Amenities" },
  { key: "status", label: "Status" },
  { key: "location", label: "Location" },
  { key: "addedDate", label: "Added Date" },
];

export default function CompareClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idsFromUrl = searchParams.get("ids") || "";
  const initialIds = idsFromUrl ? idsFromUrl.split(",").filter(Boolean) : [];

  const [propertyIds, setPropertyIds] = useState(initialIds);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const idsParam = propertyIds.join(",");

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (propertyIds.length > 0) {
      params.set("ids", idsParam);
    } else {
      params.delete("ids");
    }
    const newUrl = params.toString() ? `/compare?${params.toString()}` : "/compare";
    router.replace(newUrl, { scroll: false });
  }, [idsParam]);

  const { data: propertiesData, isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const res = await axios.get("/properties");
      return res.data.properties || [];
    },
  });

  const { data: comparedProperties, isLoading: isCompareLoading } = useQuery({
    queryKey: ["compare", ...propertyIds],
    queryFn: async () => {
      if (propertyIds.length === 0) return [];
      const promises = propertyIds.map((id) =>
        axios.get(`/properties/${id}`).then((r) => r.data.property || r.data)
      );
      return Promise.all(promises);
    },
    enabled: propertyIds.length > 0,
  });

  const allProperties = useMemo(() => propertiesData || [], [propertiesData]);
  const compared = useMemo(() => comparedProperties || [], [comparedProperties]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return allProperties
      .filter(
        (p) =>
          !propertyIds.includes(p._id) &&
          (p.title?.toLowerCase().includes(term) ||
            p.location?.city?.toLowerCase().includes(term) ||
            p.location?.address?.toLowerCase().includes(term))
      )
      .slice(0, 8);
  }, [allProperties, propertyIds, searchTerm]);

  const addProperty = (id) => {
    if (propertyIds.length >= 3) return;
    setPropertyIds((prev) => [...prev, id]);
    setShowAddDropdown(false);
    setSearchTerm("");
  };

  const removeProperty = (id) => {
    setPropertyIds((prev) => prev.filter((pid) => pid !== id));
  };

  const getBestValue = (key) => {
    if (compared.length < 2) return null;
    const values = compared.map((p) => getValue(p, key));
    if (key === "price" || key === "deposit") {
      const nums = values.map((v) => parseFloat(String(v).replace(/[^0-9.]/g, "")));
      const min = Math.min(...nums.filter((n) => !isNaN(n)));
      return nums.indexOf(min);
    }
    if (key === "area") {
      const nums = values.map((v) => parseFloat(String(v).replace(/[^0-9.]/g, "")));
      const max = Math.max(...nums.filter((n) => !isNaN(n)));
      return nums.indexOf(max);
    }
    if (key === "amenities") {
      const counts = values.map((v) => (Array.isArray(v) ? v.length : 0));
      const max = Math.max(...counts);
      return counts.indexOf(max);
    }
    if (key === "bedrooms" || key === "bathrooms") {
      const nums = values.map((v) => Number(v) || 0);
      const max = Math.max(...nums);
      return nums.indexOf(max);
    }
    return null;
  };

  const getValue = (property, key) => {
    switch (key) {
      case "image":
        return property.images?.[0] || "";
      case "title":
        return property.title || "Untitled";
      case "price":
        return property.price;
      case "purpose":
        return property.purpose || "N/A";
      case "type":
        return Array.isArray(property.type)
          ? property.type[0]
          : property.type || "N/A";
      case "bedrooms":
        return property.bedrooms ?? "N/A";
      case "bathrooms":
        return property.bathrooms ?? "N/A";
      case "area":
        return property.area ?? "N/A";
      case "deposit":
        return property.deposit ?? "N/A";
      case "amenities":
        return property.amenities || [];
      case "status":
        return property.status || "available";
      case "location":
        return property.location?.city || property.location?.address || "N/A";
      case "addedDate":
        return property.createdAt || property.created || "N/A";
      default:
        return "N/A";
    }
  };

  const renderValue = (property, key) => {
    const val = getValue(property, key);
    switch (key) {
      case "image":
        return val ? (
          <Image
            src={val}
            alt={property.title}
            width={400}
            height={128}
            className="w-full h-32 object-cover rounded-xl"
          />
        ) : (
          <div className="w-full h-32 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400">
            <Home size={28} />
          </div>
        );
      case "title":
        return (
          <Link
            href={`/properties/${property._id}`}
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 text-sm"
          >
            {val} <ExternalLink size={12} />
          </Link>
        );
      case "price":
      case "deposit":
        return val !== "N/A" && val !== null && val !== undefined ? (
          <span className="font-bold text-base text-slate-800 dark:text-white">
            <span className="text-slate-400 text-xs">₹</span>
            {Number(val).toLocaleString("en-IN")}
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        );
      case "purpose":
        return (
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
              val === "sell"
                ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
            }`}
          >
            {val === "sell" ? "For Sale" : "For Rent"}
          </span>
        );
      case "type":
        return (
          <span className="capitalize text-slate-700 dark:text-slate-300 font-semibold text-sm">
            {val}
          </span>
        );
      case "bedrooms":
      case "bathrooms":
        return val !== "N/A" ? (
          <div className="flex items-center gap-1.5 justify-center">
            {key === "bedrooms" ? (
              <Bed size={14} className="text-indigo-400" />
            ) : (
              <Bath size={14} className="text-indigo-400" />
            )}
            <span className="font-bold">{val}</span>
          </div>
        ) : (
          <span className="text-slate-400">-</span>
        );
      case "area":
        return val !== "N/A" ? (
          <div className="flex items-center gap-1.5 justify-center">
            <Maximize2 size={14} className="text-indigo-400" />
            <span className="font-bold">{Number(val).toLocaleString("en-IN")}</span>
            <span className="text-xs text-slate-400">sqft</span>
          </div>
        ) : (
          <span className="text-slate-400">-</span>
        );
      case "amenities":
        return Array.isArray(val) && val.length > 0 ? (
          <div className="flex flex-wrap gap-1 justify-center">
            {val.slice(0, 5).map((a, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-xs rounded-md text-slate-600 dark:text-slate-400"
              >
                {a}
              </span>
            ))}
            {val.length > 5 && (
              <span className="text-xs text-indigo-500 font-medium">
                +{val.length - 5}
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-400">-</span>
        );
      case "status":
        return (
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize ${
              val === "available"
                ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : val === "rented" || val === "sold"
                ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            {val}
          </span>
        );
      case "location":
        return (
          <div className="flex items-center gap-1.5 justify-center text-sm text-slate-600 dark:text-slate-400">
            <MapPin size={12} className="text-indigo-400 flex-shrink-0" />
            <span className="text-xs">{val}</span>
          </div>
        );
      case "addedDate":
        return val !== "N/A" ? (
          <div className="flex items-center gap-1.5 justify-center text-sm text-slate-500">
            <Calendar size={12} />
            <span className="text-xs">{new Date(val).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}</span>
          </div>
        ) : (
          <span className="text-slate-400">-</span>
        );
      default:
        return String(val);
    }
  };

  const bestIdx = useMemo(() => {
    const map = {};
    ROWS.forEach((row) => {
      const idx = getBestValue(row.key);
      if (idx !== null) map[row.key] = idx;
    });
    return map;
  }, [compared]);

  if (isLoading || isCompareLoading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="app-container pt-28 md:pt-36 pb-20">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-64" />
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-96" />
            <div className="grid grid-cols-3 gap-4 mt-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="h-8 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="app-container pt-28 md:pt-36 pb-28 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-3 border border-indigo-100 dark:border-indigo-800/50">
            <ArrowUpDown size={12} /> Compare
          </div>
          <h1 className="section-title">Compare Properties</h1>
          <p className="section-subtitle">
            Select up to 3 properties to compare side by side
          </p>
        </motion.div>

        {compared.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-5">
              <ArrowUpDown size={32} className="text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Add properties to compare
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 font-medium">
              Select properties to see them side by side and find the best deal.
            </p>
            <Link
              href="/properties"
              className="btn-primary shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              Browse Properties
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Selected Properties Bar */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {compared.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center gap-2 app-card px-4 py-2"
                >
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                    {p.title}
                  </span>
                  <button
                    onClick={() => removeProperty(p._id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {propertyIds.length < 3 && (
                <div className="relative">
                  <button
                    onClick={() => setShowAddDropdown(!showAddDropdown)}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
                  >
                    <Plus size={16} /> Add Property
                  </button>
                  {showAddDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50">
                      <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                        <div className="relative">
                          <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="text"
                            placeholder="Search properties..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-9"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto p-2">
                        {filteredOptions.length > 0 ? (
                          filteredOptions.map((p) => (
                            <button
                              key={p._id}
                              onClick={() => addProperty(p._id)}
                              className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors text-left"
                            >
                              {p.images?.[0] ? (
                                <Image
                                  src={p.images[0]}
                                  alt=""
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                  unoptimized
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                                  <i className="fas fa-image text-slate-300 dark:text-slate-600 text-xs"></i>
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                                  {p.title}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                  {p.location?.city || ""}
                                </p>
                              </div>
                            </button>
                          ))
                        ) : searchTerm.trim() ? (
                          <p className="text-sm text-slate-400 text-center py-6">
                            No properties found
                          </p>
                        ) : (
                          <p className="text-sm text-slate-400 text-center py-6">
                            Type to search properties
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto -mx-4 md:-mx-0">
              <div className="inline-block min-w-full px-4 md:px-0">
                <div className="space-y-3 min-w-[640px]">
                  {ROWS.map((row) => {
                    const best = bestIdx[row.key];
                    return (
                      <div key={row.key} className="app-card overflow-hidden">
                        <div className="flex">
                          <div className="w-[140px] shrink-0 p-4 bg-slate-50 dark:bg-slate-900 flex items-center border-r border-slate-100 dark:border-slate-700/50">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              {row.label}
                            </span>
                          </div>
                          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${compared.length}, 1fr)` }}>
                            {compared.map((p, idx) => (
                              <div
                                key={p._id}
                                className={`p-4 flex items-center justify-center relative ${
                                  best === idx
                                    ? "bg-emerald-50/50 dark:bg-emerald-900/10"
                                    : "bg-white dark:bg-slate-950"
                                } border-r last:border-r-0 border-slate-100 dark:border-slate-700/50`}
                              >
                                {best === idx && (
                                  <div className="absolute -top-2 right-2">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded-full shadow-sm">
                                      <Check size={8} /> Best
                                    </span>
                                  </div>
                                )}
                                <div className="text-center">
                                  {renderValue(p, row.key)}
                                  {row.key === "image" && (
                                    <button
                                      onClick={() => removeProperty(p._id)}
                                      className="mt-2 text-slate-300 hover:text-rose-500 transition-colors"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
