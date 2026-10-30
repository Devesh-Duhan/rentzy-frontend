"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Star, Send, Loader2, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";

const ReviewForm = ({ propertyId, onReviewAdded }) => {
   const [rating, setRating] = useState(5);
   const [comment, setComment] = useState("");
   const [isSubmitting, setIsSubmitting] = useState(false);
   const { user } = useSelector((state) => state.auth);
   const router = useRouter();

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!user) {
         toast.error("Please login to leave a review");
         router.push("/login");
         return;
      }
      if (!comment.trim()) return;

      try {
         setIsSubmitting(true);
         await axiosInstance.post("/reviews", { propertyId, rating, comment });
         setComment("");
         setRating(5);
         onReviewAdded();
         toast.success("Experience shared successfully");
      } catch (e) {
         toast.error(e.response?.data?.message || "Failed to submit review");
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="relative p-1 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-[40px] mb-16 overflow-hidden">
         <div className="p-8 md:p-12 bg-white dark:bg-slate-900 rounded-[38px] backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                  <MessageSquare size={24} />
               </div>
               <div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Share Your Experience</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Help others find their perfect home</p>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
               <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Rating</span>
                  <div className="flex gap-3">
                     {[1, 2, 3, 4, 5].map((s) => (
                        <button
                           key={s}
                           type="button"
                           onClick={() => setRating(s)}
                           className={`group transition-all duration-500 transform ${s <= rating ? 'scale-110 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'opacity-40 hover:opacity-100 hover:scale-110'}`}
                        >
                           <Star fill={s <= rating ? "#f59e0b" : "none"} stroke={s <= rating ? "#f59e0b" : "currentColor"} size={36} strokeWidth={2.5} />
                        </button>
                     ))}
                  </div>
               </div>

               <div className="relative">
                  <textarea
                     value={comment}
                     onChange={(e) => setComment(e.target.value)}
                     placeholder="Tell us what makes this property special..."
                     className="w-full p-8 bg-slate-50 dark:bg-white/5 border-2 border-transparent rounded-[32px] text-base font-bold text-slate-700 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all resize-none h-48 shadow-inner"
                     required
                  ></textarea>
                  <button
                     type="submit"
                     disabled={isSubmitting}
                     className="absolute bottom-8 right-8 px-10 py-5 bg-indigo-600 text-white rounded-[24px] shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 overflow-hidden group/submit"
                  >
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/submit:translate-x-full transition-transform duration-1000"></div>
                     {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                        <>
                           <span className="font-black text-xs uppercase tracking-widest">Publish Review</span>
                           <Send size={18} />
                        </>
                     )}
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
};

export default ReviewForm;
