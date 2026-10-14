"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  UserCircle, Calendar, Settings, Home, LogOut, ArrowRight, ShieldCheck, Store, MapPin, ChevronRight,
  Heart, Eye, Star, Bell, Clock, MessageSquare, ThumbsUp, Bookmark,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { logout, reset } from "@/store/slices/authSlice";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";

const REVIEWS = [
  { property: "Skyline Apartments", rating: 5, date: "2026-07-15", text: "Amazing property! The location is perfect." },
  { property: "Greenwood Villa", rating: 4, date: "2026-07-10", text: "Great value for money. Would recommend." },
  { property: "Downtown Studio", rating: 5, date: "2026-06-28", text: "Exactly as described. Very smooth process." },
];

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const { data: savedData } = useQuery({
    queryKey: ["savedProperties"],
    queryFn: async () => {
      const res = await axios.get("/saved-properties");
      return res.data;
    },
    enabled: !!user && activeTab === "saved",
  });

  // Backend responds with { success, count, data: [...] } - a bare object, not
  // an array. Falling through to `savedData` would call .slice() on an object.
  const savedProperties = savedData?.data || savedData?.savedProperties || savedData?.properties ||
    (Array.isArray(savedData) ? savedData : []);

  const { data: recentData } = useQuery({
    queryKey: ["recentlyViewed"],
    queryFn: async () => {
      let ids = [];
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("recentlyViewed");
        ids = stored ? JSON.parse(stored) : [];
      }
      if (ids.length === 0) return [];
      const results = await Promise.all(
        ids.slice(0, 8).map((id) => axios.get(`/properties/${id}`).then((res) => res.data).catch(() => null))
      );
      return results.filter(Boolean);
    },
    enabled: !!user && activeTab === "recent",
  });

  const RECENT_VIEWS = recentData || [];

  if (!user) return null;

  const dashboardLink = user.role === "admin" ? "/admin" : user.role === "seller" ? "/seller" : null;
  const dashboardText = user.role === "admin" ? "Admin Dash" : user.role === "seller" ? "Seller Dash" : null;
  const DashboardIcon = user.role === "admin" ? ShieldCheck : Store;

  const tabs = [
    { id: "overview", label: "Profile", icon: UserCircle },
    { id: "saved", label: "Saved Properties", icon: Heart },
    { id: "recent", label: "Recent Views", icon: Eye },
    { id: "reviews", label: "My Reviews", icon: Star },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <div className="pt-28 md:pt-36 pb-24 px-4 sm:px-6">
        <div className="app-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="app-card p-5 md:p-8 lg:p-10 flex flex-col md:flex-row gap-8 md:gap-12"
          >
            {/* Sidebar */}
            <div className="md:w-72 shrink-0">
              <div className="flex md:flex-col items-center md:text-center pb-8 border-b border-slate-100 dark:border-slate-700/50">
                <div className="relative mb-4">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden border-2 border-white dark:border-slate-800">
                    {user.profileImage ? <Image src={user.profileImage} alt={user.name ? `${user.name}'s profile photo` : 'Profile photo'} width={112} height={112} className="w-full h-full object-cover" unoptimized /> : user.name.charAt(0)}
                  </div>
                  {user.role === 'admin' && <div className="absolute -top-1 -right-1 p-1.5 bg-indigo-600 text-white rounded-xl"><ShieldCheck size={14} /></div>}
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
                <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-wider">{user.role} Partner</p>
                <div className="mt-3 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-400 text-xs rounded-xl border border-slate-100 dark:border-slate-700/50">
                  {user.email}
                </div>
              </div>

              <nav className="flex flex-col gap-1.5 mt-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all ${activeTab === tab.id
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                  >
                    <tab.icon size={18} />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}

                {dashboardLink && (
                  <Link
                    href={dashboardLink}
                    className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md hover:shadow-lg transition-all mt-2"
                  >
                    <div className="flex items-center gap-3">
                      <DashboardIcon size={18} />
                      <span className="text-sm font-medium">{dashboardText}</span>
                    </div>
                    <ArrowRight size={16} />
                  </Link>
                )}

                <button
                  onClick={() => {
                    dispatch(logout());
                    dispatch(reset());
                    router.push("/");
                  }}
                  className="flex items-center gap-3 px-5 py-3.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-all mt-6 text-sm font-medium"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 md:border-l md:border-slate-100 dark:md:border-slate-700/50 md:pl-10 min-w-0">
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div>
                      <h2 className="section-title">Identity Detail</h2>
                      <p className="section-subtitle">Manage your core profile and preferences</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: "Legal Name", value: user.name },
                        { label: "Email Route", value: user.email },
                        { label: "Membership", value: user.role.toUpperCase() },
                        { label: "Location Status", value: user.address || "Not Provided" }
                      ].map((item, i) => (
                        <div key={i} className="app-card p-5 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all">
                          <label className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1 block uppercase tracking-wider">{item.label}</label>
                          <p className="text-base font-semibold text-slate-900 dark:text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-5 pt-8 border-t border-slate-100 dark:border-slate-700/50">
                      {user.role === 'buyer' ? (
                        <div className="app-card overflow-hidden">
                          <div className="p-6 bg-indigo-600 text-white">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                              <div>
                                <h4 className="text-lg font-bold mb-1">Upgrade to Seller</h4>
                                <p className="text-indigo-100 text-sm">List unlimited properties and earn directly.</p>
                              </div>
                              <Link href="/become-seller" className="btn-secondary bg-white text-indigo-600 border-white hover:bg-indigo-50 shrink-0">
                                Start Selling Now
                              </Link>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { label: "Total Reach", val: "12.4K" },
                            { label: "Conversion", val: "8.2%" },
                            { label: "Growth", val: "+24%" }
                          ].map((s, i) => {
                            const colors = ["emerald", "indigo", "purple"];
                            return (
                              <div key={s.label} className="app-card p-4">
                                <p className={`text-xs font-semibold text-${colors[i]}-600 dark:text-${colors[i]}-400 uppercase tracking-wider mb-0.5`}>{s.label}</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{s.val}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "saved" && (
                  <motion.div key="saved" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="flex items-end justify-between">
                      <div>
                        <h2 className="section-title">Saved Properties</h2>
                        <p className="section-subtitle">Properties you&apos;ve bookmarked</p>
                      </div>
                      <Link
                        href="/wishlist"
                        className="btn-ghost text-xs hidden sm:inline-flex items-center gap-1.5"
                      >
                        <Bookmark size={14} /> View All
                      </Link>
                    </div>

                    <div className="app-grid">
                      {savedProperties.slice(0, 4).map((item, i) => {
                        const prop = item.property || item;
                        return (
                          <PropertyCard
                            key={prop._id || prop.id || i}
                            id={prop._id || prop.id}
                            title={prop.title}
                            location={typeof prop.location === "object" ? `${prop.location?.city || ""}, ${prop.location?.state || ""}` : prop.location}
                            price={prop.price?.toLocaleString("en-IN") || "0"}
                            images={prop.images?.filter(Boolean) ?? []}
                            type={prop.type}
                            purpose={prop.purpose || "rent"}
                          />
                        );
                      })}
                    </div>

                    {savedProperties.length === 0 && (
                      <div className="app-card py-16 flex flex-col items-center justify-center text-center border-dashed">
                        <Heart size={40} className="text-slate-300 dark:text-slate-600 mb-3" />
                        <h3 className="text-base font-semibold text-slate-700 dark:text-white">No saved properties</h3>
                        <p className="text-sm text-slate-400 mt-1">Start exploring and save properties you like.</p>
                        <Link href="/properties" className="btn-primary mt-5">Browse Properties</Link>
                      </div>
                    )}

                    {savedProperties.length > 4 && (
                      <div className="text-center">
                        <Link href="/wishlist" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1">
                          View all saved properties <ArrowRight size={14} />
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "recent" && (
                  <motion.div key="recent" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div>
                      <h2 className="section-title">Recently Viewed</h2>
                      <p className="section-subtitle">Properties you&apos;ve checked out recently</p>
                    </div>

                    <div className="app-grid">
                      {RECENT_VIEWS.map((property, i) => (
                        <motion.div
                          key={property._id || property.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="h-full flex"
                        >
                          <PropertyCard
                            id={property._id || property.id}
                            title={property.title}
                            location={typeof property.location === "object" ? [property.location?.address, property.location?.city, property.location?.state].filter(Boolean).join(", ") : property.location}
                            price={property.price?.toLocaleString("en-IN") || "0"}
                            images={property.images?.filter(Boolean) ?? []}
                            type={property.type}
                            purpose={Array.isArray(property.purpose) ? property.purpose[0] : property.purpose || "rent"}
                            isNew={property.isNew}
                            area={property.areaSqFt || property.area}
                            bhk={property.bedrooms || property.bhk}
                            bathrooms={property.bathrooms}
                            furnishing={property.furnishing}
                            pricePerSqft={property.pricePerSqft}
                          />
                        </motion.div>
                      ))}
                    </div>

                    {RECENT_VIEWS.length === 0 && (
                      <div className="app-card py-16 flex flex-col items-center justify-center text-center border-dashed">
                        <Eye size={40} className="text-slate-300 dark:text-slate-600 mb-3" />
                        <h3 className="text-base font-semibold text-slate-700 dark:text-white">No recently viewed properties</h3>
                        <p className="text-sm text-slate-400 mt-1">Properties you view will appear here.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "reviews" && (
                  <motion.div key="reviews" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div>
                      <h2 className="section-title">My Reviews</h2>
                      <p className="section-subtitle">Reviews you&apos;ve written for properties</p>
                    </div>

                    <div className="space-y-3">
                      {REVIEWS.map((review, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="app-card p-5 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{review.property}</h4>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {new Date(review.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, s) => (
                                <Star
                                  key={s}
                                  size={13}
                                  className={s < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-700"}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{review.text}</p>
                        </motion.div>
                      ))}
                    </div>

                    {REVIEWS.length === 0 && (
                      <div className="app-card py-16 flex flex-col items-center justify-center text-center border-dashed">
                        <MessageSquare size={40} className="text-slate-300 dark:text-slate-600 mb-3" />
                        <h3 className="text-base font-semibold text-slate-700 dark:text-white">No reviews yet</h3>
                        <p className="text-sm text-slate-400 mt-1">Reviews you write for properties will appear here.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "settings" && (
                  <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div>
                      <h2 className="section-title">Settings</h2>
                      <p className="section-subtitle">Manage your account preferences</p>
                    </div>

                    <div className="space-y-3">
                      <Link
                        href="/notifications/preferences"
                        className="app-card p-5 flex items-center justify-between hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Bell size={18} />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Notification Preferences</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Manage email and push notifications</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                      </Link>

                      <div className="app-card p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                            <Settings size={18} />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Account Security</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Password & authentication</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300" />
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-700/50">
                      {user.isGoogleUser ? (
                        <div className="app-card p-5 flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                            <ShieldCheck size={20} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Google Managed Account</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              You are logged in via Google. Your security settings are managed by your Google Account.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="app-card p-5 flex gap-4 border-amber-100 dark:border-amber-800/30">
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                              <Star size={20} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-amber-800 dark:text-amber-400 text-sm">Security Notice</h4>
                              <p className="text-xs text-amber-600 dark:text-amber-500/80 mt-1">
                                Your account is protected by standard encryption. Enable two-factor authentication for maximum security.
                              </p>
                            </div>
                          </div>

                          <button className="app-card p-5 flex items-center justify-between hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all w-full text-left">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500"><Settings size={16} /></div>
                              <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Change Credentials</p>
                                <p className="text-xs text-slate-400 mt-0.5">Update password and email</p>
                              </div>
                            </div>
                            <ChevronRight size={16} className="text-slate-300" />
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
