"use client";

import Image from "next/image";
import React, { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSearchParams, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getProperty } from "@/store/slices/propertySlice";
import axiosInstance from "@/lib/axios";
import { Star, Send, Loader2, Share2, Flag, Calendar, Calculator, FileText, TrendingUp, MapPin, Bed, Bath, Maximize2, Home, Check, Phone, ChevronRight, Key, CreditCard, Headphones, MessageCircle, TrendingDown, Tag, Heart, ChevronDown, Grid3X3, Info, ShieldCheck, ArrowLeft, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, Compass, Layers, CalendarCheck, Sofa, Percent, IndianRupee, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import PropertyDetailGallery from "@/components/PropertyDetailGallery";
import ShareProperty from "@/components/ShareProperty";
import ReportProperty from "@/components/ReportProperty";
import ScheduleVisit from "@/components/ScheduleVisit";
import LoanCalculator from "@/components/LoanCalculator";
import RecentlyViewed from "@/components/RecentlyViewed";
import TrustScore from "@/components/TrustScore";
import dynamic from "next/dynamic";

const PropertyMap = dynamic(() => import("@/components/PropertyMap"), { ssr: false });

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
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="app-card p-6 mb-8 border-indigo-100 dark:border-indigo-800/30 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900">
      <h4 className="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
        <Star size={18} className="text-indigo-600" fill="currentColor" /> Leave a Review
      </h4>
      <div className="flex gap-1.5 mb-4">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            className={`transition-all p-1 ${s <= rating ? 'text-amber-400 scale-110' : 'text-slate-200 dark:text-slate-700'}`}
          >
            <Star fill={s <= rating ? "currentColor" : "none"} size={24} />
          </button>
        ))}
      </div>
      <div className="relative">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this property..."
          className="input-field resize-none h-28 pt-4 pr-16"
          required
        ></textarea>
        <button
          type="submit"
          disabled={isSubmitting}
          className="absolute bottom-3 right-3 p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        </button>
      </div>
    </form>
  );
};

const TABS = [
  { id: "details", label: "Details", icon: Info },
  { id: "map", label: "Map", icon: MapPin },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "documents", label: "Documents", icon: FileText },
];

const PropertyDetailContent = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const { id } = params;

  const dispatch = useDispatch();
  const { property, isLoading, isError, message } = useSelector((state) => state.property);

  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const [isBooking, setIsBooking] = useState(false);
  const [isCashfreeBooking, setIsCashfreeBooking] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const loadCashfreeScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCashfreeBooking = async () => {
    if (!property) return;
    try {
      setIsCashfreeBooking(true);
      const res = await loadCashfreeScript();
      if (!res) {
        toast.error('Cashfree SDK failed to load. Are you online?');
        setIsCashfreeBooking(false);
        return;
      }

      const { data } = await axiosInstance.post('/bookings/create-cashfree-order', {
        propertyId: property._id,
        date: new Date().toISOString(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        amount: property.price
      });

      const cashfree = window.Cashfree({
        mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'PROD' ? 'production' : 'sandbox'
      });

      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        returnUrl: `${window.location.origin}/properties/${property._id}`
      });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error occurred during Cashfree booking');
    } finally {
      setIsCashfreeBooking(false);
    }
  };

  const handleBookProperty = async () => {
    if (!property) return;
    try {
      setIsBooking(true);
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setIsBooking(false);
        return;
      }

      const { data } = await axiosInstance.post('/bookings/create-order', {
        propertyId: property._id,
        date: new Date().toISOString(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        amount: property.price
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'dummy_id',
        amount: data.amount,
        currency: data.currency,
        name: 'rentzypro',
        description: `Booking Base Payment for ${property.title}`,
        order_id: data.orderId,
        handler: async function (response) {
          try {
            await axiosInstance.post('/bookings/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: data.bookingId
            });
            toast.success('Payment Successful & Booking Confirmed!');
          } catch (error) {
            console.error(error);
            toast.error('Payment verification failed!');
          }
        },
        prefill: {
          name: "Verified User",
          email: "tenant@example.com",
        },
        theme: {
          color: '#4f46e5'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error occurred during booking creation');
    } finally {
      setIsBooking(false);
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(getProperty(id));
      try {
        const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const updated = [id, ...viewed.filter(v => v !== id)].slice(0, 10);
        localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      } catch (e) {}
    }
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [dispatch, searchParams, id]);

  const [nearby, setNearby] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [documents, setDocuments] = useState([]);

  const fetchReviews = async () => {
    if (!id) return;
    try {
      const { data } = await axiosInstance.get(`/reviews/${id}`);
      setReviews(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (property?.type) {
      const fetchNearby = async () => {
        try {
          const { data } = await axiosInstance.get(`/properties`, {
            params: { type: property.type.toLowerCase(), limit: 4 }
          });
          setNearby(data.properties.filter(p => p._id !== id));
        } catch (e) {
          console.error(e);
        }
      };
      fetchNearby();
      fetchReviews();
    }
  }, [property, id]);

  useEffect(() => {
    if (id) {
      const fetchPriceHistory = async () => {
        try {
          const { data } = await axiosInstance.get(`/price-history/${id}`);
          setPriceHistory(data.data || []);
        } catch (e) {
          console.error(e);
        }
      };
      fetchPriceHistory();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const fetchDocuments = async () => {
        try {
          const { data } = await axiosInstance.get(`/property-documents`, {
            params: { property: id }
          });
          setDocuments(Array.isArray(data) ? data : data?.documents || []);
        } catch (e) {
          console.error(e);
        }
      };
      fetchDocuments();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const fetchPriceHistory = async () => {
        try {
          const { data } = await axiosInstance.get(`/price-history/${id}`);
          setPriceHistory(Array.isArray(data) ? data : data?.data || []);
        } catch (e) {
          // Price history not available
        }
      };
      fetchPriceHistory();
    }
  }, [id]);

  const formatProperty = (prop) => ({
    id: prop._id || prop.id,
    title: prop.title,
    location: `${prop.location?.address || ''}, ${prop.location?.city || ''}`,
    price: prop.price?.toLocaleString(),
    image: prop.images?.[0] || prop.image || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    type: prop.type,
    isNew: prop.isNew || (new Date() - new Date(prop.createdAt) < 7 * 24 * 60 * 60 * 1000),
    hasPrivateMedia: prop.images?.length > 1,
    furnishing: prop.furnishing,
    postedBy: prop.postedBy,
    pricePerSqft: prop.pricePerSqft,
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <Navbar />

      <main className="app-container pt-4 md:pt-6 pb-32 md:pb-10">
        <div>
          {isLoading ? (
            <div className="w-full py-20 flex flex-col items-center justify-center text-slate-400">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent mb-4" />
              <span className="font-medium text-sm">Loading Property Details...</span>
            </div>
          ) : isError ? (
            <div className="w-full py-20 flex flex-col items-center justify-center text-rose-500">
              <Info size={40} className="mb-3" />
              <span className="font-bold">{message}</span>
            </div>
          ) : property ? (
            <div className="space-y-4 md:space-y-6 animate-fade-in">
              {/* Image Gallery */}
              <div className="app-card overflow-hidden p-1.5 md:p-2">
                <PropertyDetailGallery
                  images={property.images}
                  title={property.title}
                />
              </div>

              {/* Property Header */}
              <div className="app-card p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-white/5">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-semibold uppercase tracking-wider border border-indigo-200 dark:border-indigo-500/20">Zero Brokerage</span>
                      <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] font-semibold uppercase tracking-wider border border-amber-200 dark:border-amber-500/20">Premium Deal</span>
                      <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-semibold uppercase tracking-wider border border-emerald-200 dark:border-emerald-500/20">{Array.isArray(property.type) ? property.type.join(' / ') : property.type}</span>
                      {property.postedBy && (
                        <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg text-[10px] font-semibold uppercase tracking-wider border border-purple-200 dark:border-purple-500/20">
                          Posted by {property.postedBy}
                        </span>
                      )}
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight">{property.title}</h1>
                    <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                      <MapPin size={14} className="text-indigo-600 flex-shrink-0" /> {property.location?.address}, {property.location?.city}
                    </p>
                  </div>
                  <div className="text-left md:text-right shrink-0 pt-2 md:pt-0">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Monthly {property.type === 'shop' || property.type === 'commercial' ? 'Lease' : 'Rent'}</p>
                    <p className="text-2xl md:text-3xl font-bold text-indigo-600">₹{property.price?.toLocaleString()} <span className="text-xs text-slate-400 font-medium">/month</span></p>
                  </div>
                </div>

                {/* Quick Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {[
                    { label: "Bedrooms", val: property.bedrooms || "N/A", icon: Bed },
                    { label: "Bathrooms", val: property.bathrooms || "N/A", icon: Bath },
                    { label: "Square Ft", val: property.areaSqFt || "N/A", icon: Maximize2 },
                    { label: "Type", val: Array.isArray(property.type) ? property.type.join(' / ') : property.type, icon: Home },
                    { label: "Furnishing", val: property.furnishing ? (property.furnishing === 'semi-furnished' ? 'Semi-Furnished' : property.furnishing.charAt(0).toUpperCase() + property.furnishing.slice(1)) : "N/A", icon: Sofa },
                    { label: "Possession", val: property.possession ? property.possession.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "N/A", icon: CalendarCheck },
                    { label: "Floor", val: property.floor !== undefined ? `${property.floor}${property.totalFloors ? ` / ${property.totalFloors}` : ''}` : "N/A", icon: Layers },
                    { label: "Facing", val: property.facing ? property.facing.charAt(0).toUpperCase() + property.facing.slice(1) : "N/A", icon: Compass },
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 flex-shrink-0">
                        <item.icon size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{item.label}</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{item.val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div className="pb-4 border-b border-slate-100 dark:border-white/5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Info size={16} className="text-indigo-600" /> Description
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                    {property.description}
                  </p>
                </div>

                {/* Amenities */}
                <div className="mt-4 pb-4 border-b border-slate-100 dark:border-white/5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Grid3X3 size={16} className="text-indigo-600" /> Key Amenities
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(property.amenities?.length > 0 ? property.amenities : ['Parking', 'Security', 'Water Supply', 'Lift', 'Gym', 'Power Backup']).map((amenity, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                        <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 flex-shrink-0">
                          <Check size={12} />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Details */}
                <div className="mt-4 pb-4 border-b border-slate-100 dark:border-white/5">
                  <div className="grid grid-cols-2 gap-2">
                    {property.age && (
                      <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Property Age</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{property.age.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      </div>
                    )}
                    {property.pricePerSqft && (
                      <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Price per sqft</p>
                        <p className="text-sm font-bold text-indigo-600">₹{property.pricePerSqft.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop Action Buttons */}
                <div className="hidden md:flex flex-wrap gap-2 mt-4">
                  <ShareProperty url={typeof window !== 'undefined' ? window.location.href : ''} title={property.title} />
                  <ScheduleVisit propertyId={property._id} />
                  <ReportProperty propertyId={property._id} />
                  <button
                    onClick={() => document.getElementById('loan-calculator')?.scrollIntoView({ behavior: 'smooth' })}
                    className="btn-secondary flex items-center gap-2 py-2.5 px-4 text-sm"
                  >
                    <Calculator size={16} /> EMI Calculator
                  </button>
                </div>

                {/* Tabs (Desktop) */}
                <div className="hidden md:block mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                  <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                    {TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                          activeTab === tab.id
                            ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        <tab.icon size={16} />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content (Desktop) */}
                <div className="hidden md:block">
                  {activeTab === "details" && (
                    <>
                      {/* Contact Owner & Booking */}
                      <ContactOwnerSection property={property} handleBookProperty={handleBookProperty} handleCashfreeBooking={handleCashfreeBooking} isBooking={isBooking} isCashfreeBooking={isCashfreeBooking} />

                      {/* Price History in details tab */}
                      {priceHistory.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp size={18} className="text-indigo-600" /> Price History
                          </h3>
                          <div className="space-y-3">
                            {priceHistory.map((entry, i) => (
                              <PriceHistoryItem key={i} entry={entry} />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === "map" && property.location?.coordinates?.lat && property.location?.coordinates?.lng && (
                    <div className="mt-4">
                      <PropertyMap properties={[property]} height="400px" zoom={14} />
                    </div>
                  )}

                  {activeTab === "reviews" && (
                    <div className="mt-4">
                      <ReviewForm propertyId={property._id} onReviewAdded={() => fetchReviews()} />
                      <div className="space-y-4 mt-6">
                        {reviews.length > 0 ? reviews.map((review, i) => (
                          <ReviewCard key={i} review={review} />
                        )) : (
                          <div className="text-center py-8 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-400 font-medium text-sm">No reviews yet. Be the first to review!</div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "documents" && documents.length > 0 && (
                    <div className="mt-4">
                      <DocumentsList documents={documents} />
                    </div>
                  )}
                </div>

                {/* Mobile: All Content Stacked */}
                <div className="md:hidden space-y-6 mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                  {/* Contact Owner & Booking (Mobile) */}
                  <ContactOwnerSection property={property} handleBookProperty={handleBookProperty} handleCashfreeBooking={handleCashfreeBooking} isBooking={isBooking} isCashfreeBooking={isCashfreeBooking} />

                  {/* Mobile Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <ShareProperty url={typeof window !== 'undefined' ? window.location.href : ''} title={property.title} />
                    <ScheduleVisit propertyId={property._id} />
                    <ReportProperty propertyId={property._id} />
                    <button
                      onClick={() => document.getElementById('loan-calculator')?.scrollIntoView({ behavior: 'smooth' })}
                      className="btn-secondary flex items-center gap-2 py-2.5 px-4 text-sm"
                    >
                      <Calculator size={16} /> EMI
                    </button>
                  </div>

                  {/* Map (Mobile) */}
                  {property.location?.coordinates?.lat && property.location?.coordinates?.lng && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <MapPin size={16} className="text-indigo-600" /> Location on Map
                      </h3>
                      <PropertyMap properties={[property]} height="250px" zoom={14} />
                    </div>
                  )}

                  {/* Documents (Mobile) */}
                  {documents.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <FileText size={16} className="text-indigo-600" /> Property Documents
                      </h3>
                      <DocumentsList documents={documents} />
                    </div>
                  )}

                  {/* Reviews (Mobile) */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Star size={16} className="text-indigo-600" /> Reviews & Ratings
                    </h3>
                    <ReviewForm propertyId={property._id} onReviewAdded={() => fetchReviews()} />
                    <div className="space-y-4 mt-4">
                      {reviews.length > 0 ? reviews.map((review, i) => (
                        <ReviewCard key={i} review={review} />
                      )) : (
                        <div className="text-center py-8 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-400 font-medium text-sm">No reviews yet. Be the first to review!</div>
                      )}
                    </div>
                  </div>

                  {/* Price History (Mobile) */}
                  {priceHistory.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <TrendingUp size={16} className="text-indigo-600" /> Price History
                      </h3>
                      <div className="space-y-3">
                        {priceHistory.map((entry, i) => (
                          <PriceHistoryItem key={i} entry={entry} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full py-20 flex justify-center text-slate-500 font-medium">Property not found.</div>
          )}
        </div>

        {/* Loan Calculator */}
        <div id="loan-calculator" className="mt-8 md:mt-12">
          <LoanCalculator propertyPrice={property?.price} />
        </div>

        {/* Recently Viewed */}
        <div className="mt-8 md:mt-12">
          <RecentlyViewed />
        </div>

        {/* Nearby / Suggested Properties */}
        {nearby.length > 0 && (
          <div className="mt-8 md:mt-12">
            <h2 className="section-title mb-6">Suggested Properties</h2>
            <div className="app-grid">
              {nearby.map((prop) => (
                <div key={prop._id}>
                  <PropertyCard {...formatProperty(prop)} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3 safe-bottom md:hidden flex items-center gap-3 shadow-2xl">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 font-medium">Monthly Rent</p>
          <p className="text-lg font-bold text-indigo-600">₹{property?.price?.toLocaleString() || '0'}</p>
        </div>
        <ScheduleVisit propertyId={property?._id} />
        <button
          onClick={handleBookProperty}
          disabled={isBooking}
          className="btn-primary flex items-center gap-2 py-3 px-5 text-sm whitespace-nowrap"
        >
          <Key size={16} />
          {isBooking ? 'Booking...' : 'Book Now'}
        </button>
      </div>

      <Footer />
    </div>
  );
};

const ContactOwnerSection = ({ property, handleBookProperty, handleCashfreeBooking, isBooking, isCashfreeBooking }) => (
  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
      <Phone size={16} className="text-indigo-600" /> Contact Owner & Booking
    </h3>

    <div className="app-card bg-slate-50/50 dark:bg-slate-950/40 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Owner Profile & Contact */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-lg font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 overflow-hidden shadow-sm">
                {property.sellerId?.profileImage ? (
                  <Image src={property.sellerId.profileImage} width={48} height={48} className="w-full h-full object-cover" alt="" unoptimized />
                ) : (
                  property.sellerId?.name?.charAt(0) || 'U'
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center">
                <Check size={8} className="text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">Online</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{property.sellerId?.name || 'Verified Owner'}</h4>
              <p className="text-slate-400 text-[10px] font-medium">Direct Seller • Responsive</p>
              {property.sellerId?.trustScore !== undefined && (
                <div className="mt-1">
                  <TrustScore userId={property.sellerId._id} score={property.sellerId.trustScore} size="lg" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {(property.contactNumber || property.sellerId?.phone) ? (
              <a
                href={`tel:${property.contactNumber || property.sellerId?.phone}`}
                className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 rounded-xl border border-slate-100 dark:border-slate-700/50 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                    <Phone size={14} />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Call Owner</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{property.contactNumber || property.sellerId?.phone}</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </a>
            ) : null}
            <a
              href={`https://wa.me/${(property.contactNumber || property.sellerId?.phone || '919876543210').toString().replace(/\D/g, '')}?text=Hi, I am interested in your listing: ${encodeURIComponent(property.title || '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 rounded-xl border border-slate-100 dark:border-slate-700/50 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                  <MessageCircle size={14} />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">WhatsApp</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Connect instantly</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </a>
          </div>
        </div>

        {/* Desktop Divider */}
        <div className="hidden lg:flex lg:col-span-1 justify-center items-center">
          <div className="w-px h-full bg-slate-200 dark:bg-white/5" />
        </div>

        {/* Booking Section */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-3 lg:pl-2">
          <div>
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Secure Online Booking</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Zero brokerage, middlemen-free booking with complete transaction protection.
            </p>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleBookProperty}
                disabled={isBooking}
                className="btn-primary flex items-center justify-center gap-2 py-4 text-sm shadow-lg shadow-indigo-200 dark:shadow-none"
              >
                <Key size={16} />
                <span>{isBooking ? 'Processing...' : 'Elite Booking'}</span>
              </button>

              <button
                onClick={handleCashfreeBooking}
                disabled={isCashfreeBooking}
                className="btn-secondary flex items-center justify-center gap-2 py-4 text-sm"
              >
                <CreditCard size={16} />
                <span>{isCashfreeBooking ? 'Processing...' : 'Instant Credit'}</span>
              </button>
            </div>

            <a
              href={`https://wa.me/919996002136?text=I need help with property ID: ${property._id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl font-semibold text-xs text-center transition-all flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 shadow-sm"
            >
              <Headphones size={14} />
              <span>Need help? Contact Admin Support</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const PriceHistoryItem = ({ entry }) => (
  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
        entry.newPrice < entry.oldPrice
          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600'
          : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600'
      }`}>
        <TrendingUp size={16} className={entry.newPrice < entry.oldPrice ? 'rotate-180' : ''} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 line-through">₹{entry.oldPrice?.toLocaleString()}</span>
          <span className="text-slate-300 dark:text-slate-600 text-xs">→</span>
          <span className={`text-sm font-bold ${entry.newPrice < entry.oldPrice ? 'text-emerald-600' : 'text-rose-600'}`}>
            ₹{entry.newPrice?.toLocaleString()}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
          {new Date(entry.date || entry.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          {entry.reason ? ` • ${entry.reason}` : ''}
        </p>
      </div>
    </div>
    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
      entry.newPrice < entry.oldPrice
        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600'
        : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600'
    }`}>
      {entry.newPrice < entry.oldPrice ? 'DECREASE' : 'INCREASE'}
    </span>
  </div>
);

const ReviewCard = ({ review }) => (
  <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold overflow-hidden">
          {review.userId?.profileImage ? <Image src={review.userId.profileImage} width={40} height={40} className="w-full h-full object-cover" unoptimized /> : review.userId?.name?.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-sm">{review.userId?.name}</p>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{new Date(review.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex items-center gap-0.5 text-amber-400">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-slate-200 dark:text-slate-700"} />
        ))}
      </div>
    </div>
    <p className="text-slate-600 dark:text-slate-400 font-medium text-sm italic">"{review.comment}"</p>
  </div>
);

const DocumentsList = ({ documents }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {documents.map((doc, i) => (
      <a
        key={doc._id || i}
        href={doc.url || doc.file}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
          <FileText size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {doc.title || doc.name || `Document ${i + 1}`}
          </p>
          {doc.type && (
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {doc.type}
            </p>
          )}
        </div>
        <ExternalLink size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
      </a>
    ))}
  </div>
);

const PropertyDetailClient = () => (
  <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  }>
    <PropertyDetailContent />
  </Suspense>
);

export default PropertyDetailClient;
