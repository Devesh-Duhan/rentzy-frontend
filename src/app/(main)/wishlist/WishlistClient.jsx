"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Trash2,
  Calendar,
  Home,
  Bookmark,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import toast from "react-hot-toast";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import PropertySkeleton from "@/components/PropertySkeleton";

const FOLDERS = [
  { id: "all", label: "All Saved" },
  { id: "favorites", label: "Favorites" },
  { id: "to_visit", label: "To Visit" },
];

export default function WishlistClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);
  const [activeFolder, setActiveFolder] = useState("all");

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["savedProperties"],
    queryFn: async () => {
      const res = await axios.get("/saved-properties");
      return res.data;
    },
    enabled: !!user,
  });

  const savedProperties =
    data?.data || data?.savedProperties || data?.properties || [];

  const removeMutation = useMutation({
    mutationFn: async (propertyId) => {
      await axios.delete(`/saved-properties/${propertyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedProperties"] });
      toast.success("Property removed from saved");
    },
    onError: () => {
      toast.error("Failed to remove property");
    },
  });

  const filteredProperties =
    activeFolder === "all"
      ? savedProperties
      : savedProperties.filter(
          (item) =>
            (item.folder || "favorites") === activeFolder
        );

  const formatProperty = (prop) => ({
    id: prop._id || prop.id || prop.property?._id,
    title: prop.title || prop.property?.title,
    location:
      prop.location ||
      (typeof prop.property?.location === "object"
        ? `${prop.property?.location?.city || ""}, ${prop.property?.location?.state || ""}`
        : prop.property?.location) || "",
    price:
      prop.price?.toLocaleString("en-IN") ||
      prop.property?.price?.toLocaleString("en-IN") ||
      "0",
    images: prop.images?.length
      ? prop.images
      : prop.property?.images?.length
        ? prop.property.images
        : [
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
          ],
    type: prop.type || prop.property?.type,
    purpose: prop.purpose || prop.property?.purpose || "rent",
    isNew:
      prop.isNew ||
      (new Date() - new Date(prop.createdAt || prop.savedAt) <
        7 * 24 * 60 * 60 * 1000),
    hasPrivateMedia:
      (prop.images?.length || prop.property?.images?.length || 0) > 1,
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <main className="pt-28 md:pt-36 pb-28 md:pb-24">
        <section className="app-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-3 border border-rose-100 dark:border-rose-800/50">
              <Heart size={12} /> Saved Properties
            </div>
            <h1 className="section-title">
              Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">
                Wishlist
              </span>
            </h1>
            <p className="section-subtitle">
              Properties you&apos;ve saved for later. Never lose track of your
              dream home.
            </p>
          </motion.div>

          {/* Folder Tabs */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
            {FOLDERS.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeFolder === folder.id
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-rose-900/40"
                    : "app-card hover:border-rose-200 dark:hover:border-rose-800"
                }`}
              >
                {folder.id === "all" && <Bookmark size={14} />}
                {folder.id === "favorites" && <Heart size={14} />}
                {folder.id === "to_visit" && <Clock size={14} />}
                {folder.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="app-grid"
              >
                {[...Array(6)].map((_, i) => (
                  <PropertySkeleton key={i} />
                ))}
              </motion.div>
            ) : filteredProperties.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full py-24 app-card flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center text-rose-300 dark:text-rose-400 mb-5">
                  <Heart size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {activeFolder === "all"
                    ? "You haven't saved any properties yet"
                    : `No properties in "${activeFolder.replace("_", " ")}"`}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mb-8">
                  {activeFolder === "all"
                    ? "Start exploring and save properties you like to build your wishlist."
                    : "Move some properties to this folder or browse for new ones."}
                </p>
                <button
                  onClick={() => router.push("/properties/1")}
                  className="btn-primary inline-flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  <Home size={16} /> Browse Properties
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="app-grid"
              >
                {filteredProperties.map((item, i) => {
                  const prop = item.property || item;
                  const savedDate = item.savedAt || item.createdAt;
                  const folder = item.folder || "favorites";

                  return (
                    <motion.div
                      key={prop._id || prop.id || i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                      className="relative group"
                    >
                      {/* Saved Info Bar */}
                      <div className="mb-2 flex items-center justify-between px-1">
                        <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                          <Calendar size={10} />
                          Saved{" "}
                          {savedDate
                            ? new Date(savedDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}
                        </span>
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-100 dark:border-rose-500/20">
                          {folder.replace("_", " ")}
                        </span>
                      </div>

                      <PropertyCard {...formatProperty(prop)} />

                      {/* Remove Button */}
                      <button
                        onClick={() => removeMutation.mutate(item._id)}
                        className="absolute top-10 right-2 z-30 w-9 h-9 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 shadow-sm border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove from saved"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
      <Footer />
    </div>
  );
}
