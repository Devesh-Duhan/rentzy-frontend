"use client";
import ContentSkeleton from "@/components/ContentSkeleton";


import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import Footer from "@/components/Footer";

export default function TestimonialsClient() {
  const [ratingFilter, setRatingFilter] = useState(0);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const res = await axios.get("/testimonials");
      return Array.isArray(res.data) ? res.data : res.data?.data || res.data?.testimonials || [];
    },
  });

  const testimonials = (Array.isArray(data) ? data : data?.data || data?.testimonials || []).filter((t) =>
    ratingFilter === 0 ? true : t.rating === ratingFilter
  );


  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="app-container pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="section-title">What Our Users Say</h1>
          <p className="section-subtitle">Hear from our happy customers</p>
        </motion.div>

        <div className="flex justify-center gap-2 mb-10">
          <button
            onClick={() => setRatingFilter(0)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              ratingFilter === 0
                ? "btn-primary"
                : "btn-secondary"
            }`}
          >
            All
          </button>
          {[5, 4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => setRatingFilter(r)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                ratingFilter === r
                  ? "bg-amber-500 text-white"
                  : "btn-secondary"
              }`}
            >
              <Star size={12} fill={ratingFilter === r ? "white" : "none"} /> {r}
            </button>
          ))}
        </div>

        {isLoading ? (<ContentSkeleton label="Loading testimonials" className="app-grid" itemClassName="h-64" />) : isError ? <div role="alert">Could not load testimonials. <button onClick={() => refetch()} className="btn-secondary">Try again</button></div> : testimonials.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 app-card border-dashed"
          >
            <Quote size={40} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-white">No testimonials yet</h3>
            <p className="text-sm text-slate-500 mt-1">Be the first to share your experience</p>
          </motion.div>
        ) : (
          <div className="app-grid">
            {testimonials.map((t, i) => (
              <motion.div
                key={t._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="app-card p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                    {t.name?.charAt(0) || "U"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{t.name}</h3>
                    <p className="text-[11px] text-slate-400 font-medium truncate">
                      {t.designation || "Verified User"}{t.company ? ` at ${t.company}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} fill={s <= t.rating ? "#f59e0b" : "none"} className={s <= t.rating ? "text-amber-500" : "text-slate-200 dark:text-slate-700"} />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed italic">&ldquo;{t.content || t.text || t.comment}&rdquo;</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
