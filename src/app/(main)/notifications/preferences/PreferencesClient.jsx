"use client";
import ContentSkeleton from "@/components/ContentSkeleton";


import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  BellRing,
  Home,
  TrendingDown,
  MessageSquare,
  FileText,
  Tag,
  Mail,
  ChevronRight,
  Save,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "@/lib/axios";
import toast from "react-hot-toast";
import Footer from "@/components/Footer";

const PREFERENCES = [
  { key: "propertyAlerts", label: "Property Alerts", description: "New properties matching your criteria", icon: Home, email: true, push: true },
  { key: "savedSearchAlerts", label: "New Properties in Saved Searches", description: "Properties matching your saved searches", icon: Bell, email: true, push: false },
  { key: "priceDropAlerts", label: "Price Drop Alerts", description: "When a saved property drops in price", icon: TrendingDown, email: true, push: true },
  { key: "inquiryResponses", label: "Inquiry Responses", description: "When someone responds to your inquiry", icon: MessageSquare, email: true, push: true },
  { key: "blogUpdates", label: "Blog Updates", description: "New articles and market insights", icon: FileText, email: true, push: false },
  { key: "promotionalOffers", label: "Promotional Offers", description: "Deals and promotional campaigns", icon: Tag, email: true, push: true },
  { key: "newsletter", label: "Newsletter", description: "Weekly roundup of top properties", icon: Mail, email: true, push: false },
];

export default function PreferencesClient() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const [preferences, setPreferences] = useState({});

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const { data: loadedPreferences, isLoading, isError, refetch } = useQuery({
    queryKey: ["notificationPreferences", user?._id],
    queryFn: async () => {
      const res = await axios.get("/notification-preferences");
      const data = res.data?.preferences || res.data || {};
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (loadedPreferences) setPreferences(loadedPreferences);
  }, [loadedPreferences]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axios.put("/notification-preferences", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Preferences saved successfully");
    },
    onError: () => {
      toast.error("Failed to save preferences");
    },
  });

  const togglePreference = (key, channel) => {
    setPreferences((prev) => {
      const current = prev[key] || {};
      if (channel === "email") {
        return { ...prev, [key]: { ...current, email: !current.email } };
      }
      if (channel === "push") {
        return { ...prev, [key]: { ...current, push: !current.push } };
      }
      const allOff = !current.email && !current.push;
      return { ...prev, [key]: { email: allOff, push: allOff } };
    });
  };

  const handleSave = () => {
    if (isLoading || isError || !loadedPreferences || saveMutation.isPending) return;
    saveMutation.mutate(preferences);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="pt-28 md:pt-36 pb-24">
        <section className="app-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-indigo-100 dark:border-indigo-800/50">
              <BellRing size={14} /> Notifications
            </div>
            <h1 className="section-title">
              Notification{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                Preferences
              </span>
            </h1>
            <p className="section-subtitle max-w-xl">
              Control how and when you hear from us. Choose which updates matter to you.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="app-card p-8 md:p-10"
          >
            {isLoading ? (
              <ContentSkeleton label="Loading notification preferences" count={4} itemClassName="h-20" />
            ) : isError ? <div role="alert">Could not load preferences. <button onClick={() => refetch()} className="btn-secondary">Try again</button></div> : (
              <div className="space-y-2">
                {PREFERENCES.map((pref) => {
                  const prefState = preferences[pref.key] || {};
                  const emailOn = prefState.email ?? true;
                  const pushOn = prefState.push ?? true;
                  const Icon = pref.icon;

                  return (
                    <div
                      key={pref.key}
                      className="p-5 md:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-700/50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <Icon size={18} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{pref.label}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{pref.description}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 shrink-0" />
                      </div>

                      <div className="flex items-center gap-6 mt-4 ml-14">
                        {pref.email && (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</span>
                            <button
                              onClick={() => togglePreference(pref.key, "email")}
                              className={`relative w-10 h-5 rounded-full transition-all ${emailOn ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"}`}
                            >
                              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${emailOn ? "translate-x-5" : "translate-x-0"}`} />
                            </button>
                          </label>
                        )}
                        {pref.push && (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Push</span>
                            <button
                              onClick={() => togglePreference(pref.key, "push")}
                              className={`relative w-10 h-5 rounded-full transition-all ${pushOn ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"}`}
                            >
                              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${pushOn ? "translate-x-5" : "translate-x-0"}`} />
                            </button>
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isLoading || isError || !loadedPreferences || saveMutation.isPending}
                className="btn-primary inline-flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40"
              >
                {saveMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Save Preferences
              </button>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}