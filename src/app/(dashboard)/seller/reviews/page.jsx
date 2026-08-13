"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Building2, User, Calendar, MessageSquare, Reply, X, Send, ArrowUpDown, Loader2 } from "lucide-react";
import axios from "@/lib/axios";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function SellerReviews() {
  const queryClient = useQueryClient();
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['seller-reviews'],
    queryFn: async () => {
      const response = await axios.get('/reviews');
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: propertiesData } = useQuery({
    queryKey: ['seller-properties-list'],
    queryFn: async () => {
      const response = await axios.get('/properties/seller');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const reviews = Array.isArray(data?.reviews) ? data.reviews : Array.isArray(data) ? data : [];
  const properties = Array.isArray(propertiesData?.properties) ? propertiesData.properties :
    Array.isArray(propertiesData) ? propertiesData : [];

  const uniqueProperties = [...new Map((reviews.map(r => r.property).filter(Boolean)).map(p => [p._id, p])).values()];

  const filteredReviews = reviews.filter(r => propertyFilter === "all" || r.property?._id === propertyFilter);

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "date") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={14} className={i < (rating || 0) ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-700"} />
    ));
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;
    try {
      setSubmitting(true);
      await axios.post(`/reviews/${replyModal._id}/reply`, { text: replyText });
      queryClient.invalidateQueries({ queryKey: ['seller-reviews'] });
      toast.success("Reply posted");
      setReplyModal(null);
      setReplyText("");
    } catch (err) {
      toast.error("Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="section-title">Reviews</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="input-field pl-10 pr-8 appearance-none"
            >
              <option value="all">All Properties</option>
              {uniqueProperties.map((p) => (
                <option key={p._id} value={p._id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field pl-10 pr-8 appearance-none"
            >
              <option value="date">Newest First</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <div className="text-center py-16 app-card">
            <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-white">No reviews yet</h3>
            <p className="section-subtitle text-sm mt-2">Reviews from tenants will appear here once they start coming in.</p>
          </div>
        ) : (
          sortedReviews.map((review) => (
            <motion.div
              key={review._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="app-card p-6"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 flex-shrink-0">
                      <User size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{review.reviewerName || "Anonymous"}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-0.5">{renderStars(review.rating)}</div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.property && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-3">
                      <Building2 size={14} /> {review.property.title}
                    </div>
                  )}
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{review.text}</p>
                  {review.reply && (
                    <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-500/5 rounded-xl border border-indigo-100 dark:border-indigo-500/10">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
                        <Reply size={12} /> Your Reply
                      </div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{review.reply}</p>
                    </div>
                  )}
                </div>
                {!review.reply && (
                  <button
                    onClick={() => setReplyModal(review)}
                    className="btn-secondary flex items-center gap-2 text-xs py-2.5 self-start"
                  >
                    <Reply size={14} /> Reply
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {replyModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => !submitting && setReplyModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg app-card overflow-hidden shadow-2xl"
            >
              <div className="h-1.5 bg-amber-500 w-full" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Reply to Review</h3>
                  <button onClick={() => !submitting && setReplyModal(null)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className="mb-4 p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-0.5">{renderStars(replyModal?.rating)}</div>
                    <span className="text-xs font-semibold text-slate-500">{replyModal?.reviewerName || "Anonymous"}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">&ldquo;{replyModal?.text}&rdquo;</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Your Reply</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="input-field resize-none h-28"
                    placeholder="Write your reply..."
                  />
                </div>
                <button
                  onClick={submitReply}
                  disabled={submitting || !replyText.trim()}
                  className="btn-primary w-full mt-4 flex items-center justify-center gap-2 text-sm py-3.5 shadow-lg"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <><Send size={16} /> Post Reply</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
