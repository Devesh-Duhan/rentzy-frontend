"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle2, Trash2, Building2 } from "lucide-react";
import axios from "@/lib/axios";
import { Toast, DeleteConfirmationModal } from "../_components/AdminComponents";

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ id: null, name: "", type: "Review" });

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get('/reviews');
      setReviews(data);
    } catch (error) {
      showNotification("Failed to fetch reviews", "error");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleReviewDelete = (id) => {
    const review = reviews.find(r => r._id === id);
    if (review) {
      setDeleteConfig({ id: review._id, name: `Review by ${review.userId?.name}`, type: "Review" });
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/reviews/${deleteConfig.id}`);
      showNotification("Review deleted!", "info");
      fetchReviews();
    } catch (error) {
      showNotification("Delete failed", "error");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Reviews</h2>
        <span className="text-xs font-bold text-slate-400">Total: {reviews.length}</span>
      </div>
      <div className="grid gap-4">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white dark:bg-slate-800/40 p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center hover:shadow-xl transition-all group">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-slate-50 dark:bg-white/5 text-[10px] font-black text-indigo-600 rounded-full uppercase tracking-widest">{review.propertyId?.title || 'Unknown Property'}</span>
                <div className="flex text-amber-500 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className={i < review.rating ? "fill-amber-500" : "text-slate-200"} />
                  ))}
                </div>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">{review.userId?.name}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic">"{review.comment}"</p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
               <button onClick={() => handleReviewDelete(review._id)} className="p-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                  <Trash2 size={20} />
               </button>
            </div>
          </div>
        ))}
      </div>

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleConfirmDelete} 
        itemName={deleteConfig.name} 
        type="Review" 
      />

      <Toast toast={toast} />
    </div>
  );
}
