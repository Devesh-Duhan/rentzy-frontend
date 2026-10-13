"use client";

import Image from "next/image";
import React, { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSearchParams, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getProperty } from "@/store/slices/propertySlice";
import axiosInstance from "@/lib/axios";
import { Star, Send, Loader2, Share2, Flag, Calendar, Calculator, FileText, TrendingUp, MapPin, Bed, Bath, Maximize2, Home, Check, Phone, ChevronRight, Key, CreditCard, Headphones, MessageCircle, TrendingDown, Tag, Heart, ChevronDown, Grid3X3, Info, ShieldCheck, ArrowLeft, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, Compass, Layers, CalendarCheck, Sofa, Percent, IndianRupee, ExternalLink, Search } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import PropertyDetailGallery from "@/components/PropertyDetailGallery";
import ShareProperty from "@/components/ShareProperty";
import ScheduleVisit from "@/components/ScheduleVisit";
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

const PropertyDetailContent = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const { id } = params;

  const dispatch = useDispatch();
  const { property, isLoading, isError, message } = useSelector((state) => state.property);

  const [currentPage, setCurrentPage] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [isCashfreeBooking, setIsCashfreeBooking] = useState(false);

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
        mode: ['PROD', 'PRODUCTION'].includes((process.env.NEXT_PUBLIC_CASHFREE_ENV || '').toUpperCase()) ? 'production' : 'sandbox'
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
          name: user?.name || "Verified User",
          email: user?.email || "tenant@example.com",
          contact: user?.phone || "",
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
          // Public endpoint - a visitor must not be required to log in just to
          // see the documents a seller has chosen to publish for this property.
          const { data } = await axiosInstance.get(`/property-documents/public`, {
            params: { property: id, limit: 50 }
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
    image: prop.images?.[0] || prop.image,
    type: prop.type,
    isNew: prop.isNew || (new Date() - new Date(prop.createdAt) < 7 * 24 * 60 * 60 * 1000),
    hasPrivateMedia: prop.images?.length > 1,
    furnishing: prop.furnishing,
    postedBy: prop.postedBy,
    pricePerSqft: prop.pricePerSqft,
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500">
      <Navbar />

      <main className="app-container pt-[calc(var(--header-height)+16px)] md:pt-[calc(var(--header-height)+32px)] pb-32 md:pb-16 max-w-7xl mx-auto">
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
            <div className="animate-fade-in">
              {/* Header Title & Actions (Airbnb style) */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{property.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5"><MapPin size={16} className="text-indigo-600" /> {property.location?.address}, {property.location?.city}</span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="flex items-center gap-1.5 text-slate-900 dark:text-white"><Star size={16} className="fill-slate-900 dark:fill-white" /> {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 'New'}</span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="underline decoration-slate-300 underline-offset-4">{reviews.length} reviews</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <ShareProperty url={typeof window !== 'undefined' ? window.location.href : ''} title={property.title} />
                </div>
              </div>

              {/* Image Gallery */}
              <div className="mb-10 lg:mb-12">
                <PropertyDetailGallery images={property.images} title={property.title} />
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                {/* Left Column: Property Details */}
                <div className="lg:col-span-8 space-y-10 lg:space-y-12">
                  
                  {/* Overview */}
                  <div className="pb-8 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      {Array.isArray(property.type) ? property.type.join(' / ') : property.type} hosted by {property.sellerId?.name?.split(' ')[0] || 'Verified Owner'}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 font-medium text-[15px]">
                      {property.bedrooms || 1} guests · {property.bedrooms || 1} bedrooms · {property.bathrooms || 1} baths · {property.areaSqFt || 'N/A'} sqft
                    </p>
                  </div>

                  {/* Highlights */}
                  <div className="pb-8 border-b border-slate-200 dark:border-slate-800 space-y-6">
                    <div className="flex gap-4 items-start">
                      <Sofa className="w-7 h-7 text-slate-900 dark:text-white shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Furnishing</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{property.furnishing ? (property.furnishing === 'semi-furnished' ? 'Semi-Furnished' : property.furnishing.charAt(0).toUpperCase() + property.furnishing.slice(1)) : "Not specified"}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <CalendarCheck className="w-7 h-7 text-slate-900 dark:text-white shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Possession</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{property.possession ? property.possession.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Immediate"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="pb-8 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About this space</h2>
                    <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed whitespace-pre-line font-medium">
                      {property.description}
                    </p>
                  </div>

                  {/* Amenities */}
                  {property.amenities?.length > 0 && (
                    <div className="pb-8 border-b border-slate-200 dark:border-slate-800">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">What this place offers</h2>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                        {property.amenities.map((amenity, i) => (
                          <div key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                            <Check size={20} className="text-slate-900 dark:text-white shrink-0" />
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Map */}
                  {property.location?.coordinates?.lat && property.location?.coordinates?.lng && (
                    <div className="pb-8 border-b border-slate-200 dark:border-slate-800">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Where you'll be</h2>
                      <p className="text-slate-600 dark:text-slate-400 font-medium mb-6">{property.location?.address}, {property.location?.city}</p>
                      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                        <PropertyMap properties={[property]} height="400px" zoom={14} />
                      </div>
                    </div>
                  )}

                  {/* Reviews */}
                  <div className="pb-8 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <Star className="fill-slate-900 dark:fill-white text-slate-900 dark:text-white" size={20} />
                      {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 'No reviews yet'} 
                      <span className="text-slate-400 font-medium text-base ml-1">({reviews.length} reviews)</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {reviews.map((review, i) => (
                        <div key={i}>
                          <ReviewCard review={review} />
                        </div>
                      ))}
                    </div>
                    <ReviewForm propertyId={property._id} onReviewAdded={() => fetchReviews()} />
                  </div>

                  {/* Documents */}
                  {documents.length > 0 && (
                    <div className="pb-8 border-b border-slate-200 dark:border-slate-800">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Property Documents</h2>
                      <DocumentsList documents={documents} />
                    </div>
                  )}
                  
                  {/* Price History */}
                  {priceHistory.length > 0 && (
                    <div className="pb-8">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Price History</h2>
                      <div className="space-y-3">
                        {priceHistory.map((entry, i) => (
                          <PriceHistoryItem key={i} entry={entry} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Sticky Booking Widget */}
                <div className="hidden lg:block lg:col-span-4">
                  <div className="sticky top-28">
                    <div className="border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.05)] dark:shadow-none bg-white dark:bg-slate-900/50">
                      <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">₹{property.price?.toLocaleString()}</span>
                        <span className="text-slate-500 font-medium text-sm">/month</span>
                      </div>
                      
                      <ContactOwnerSection 
                        property={property} 
                        handleBookProperty={handleBookProperty} 
                        handleCashfreeBooking={handleCashfreeBooking} 
                        isBooking={isBooking} 
                        isCashfreeBooking={isCashfreeBooking} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full py-32 flex flex-col items-center justify-center text-slate-500 font-medium">
              <Search className="w-12 h-12 text-slate-300 mb-4" />
              <p>Property not found.</p>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3 safe-bottom md:hidden flex items-center gap-3 shadow-2xl">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 font-medium">Monthly Rent</p>
          <p className="text-lg font-bold text-indigo-600">₹{property?.price?.toLocaleString() || '0'}</p>
        </div>
        <a
          href={`https://wa.me/${(property?.contactNumber || property?.sellerId?.phone || '919876543210').toString().replace(/\D/g, '')}?text=Hi, I am interested in your listing: ${encodeURIComponent(property?.title || '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 py-3 px-5 text-sm whitespace-nowrap bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
        >
          <MessageCircle size={18} />
          WhatsApp
        </a>
      </div>

      <Footer />
    </div>
  );
};

const ContactOwnerSection = ({ property, handleBookProperty, handleCashfreeBooking, isBooking, isCashfreeBooking }) => (
  <div className="flex flex-col gap-6">
    {/* Booking Buttons (Temporarily Disabled as requested) */}
    {/*
    <div className="space-y-3">
      <button
        onClick={handleBookProperty}
        disabled={isBooking}
        className="w-full bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] disabled:opacity-70"
      >
        <Key size={18} />
        <span>{isBooking ? 'Processing...' : 'Reserve Now'}</span>
      </button>

      <button
        onClick={handleCashfreeBooking}
        disabled={isCashfreeBooking}
        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-900 dark:text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 shadow-sm"
      >
        <CreditCard size={18} />
        <span>{isCashfreeBooking ? 'Processing...' : 'Pay with Credit'}</span>
      </button>
      
      <p className="text-center text-xs text-slate-500 font-medium pt-2">You won't be charged yet</p>
    </div>

    <div className="h-px w-full bg-slate-200 dark:bg-slate-800 my-2" />
    */}

    {/* Owner Info */}
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Hosted by {property.sellerId?.name?.split(' ')[0] || 'Verified Owner'}</h4>
          <p className="text-slate-500 text-sm mt-0.5">Direct Seller • Very responsive</p>
        </div>
        <div className="relative shrink-0">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-lg font-bold text-slate-400 overflow-hidden shadow-sm">
            {property.sellerId?.profileImage ? (
              <Image src={property.sellerId.profileImage} width={56} height={56} className="w-full h-full object-cover" alt="" unoptimized />
            ) : (
              property.sellerId?.name?.charAt(0) || 'U'
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
            <Check size={8} className="text-white" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2">
        {(property.contactNumber || property.sellerId?.phone) ? (
          <a
            href={`tel:${property.contactNumber || property.sellerId?.phone}`}
            className="flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <Phone size={18} className="text-slate-700 dark:text-slate-300" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Call Host</span>
          </a>
        ) : null}
        <a
          href={`https://wa.me/${(property.contactNumber || property.sellerId?.phone || '919876543210').toString().replace(/\D/g, '')}?text=Hi, I am interested in your listing: ${encodeURIComponent(property.title || '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors"
        >
          <MessageCircle size={18} className="text-emerald-600 dark:text-emerald-500" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">WhatsApp</span>
        </a>
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
