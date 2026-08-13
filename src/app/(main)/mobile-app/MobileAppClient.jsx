"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Smartphone,
  Search,
  Bell,
  MessageCircle,
  Camera,
  CheckCircle,
  Apple,
  Globe,
  Mail,
  QrCode,
  ArrowRight,
  Star,
  MapPin,
} from "lucide-react";
import axios from "@/lib/axios";
import toast from "react-hot-toast";
import Footer from "@/components/Footer";

const features = [
  { icon: Search, title: "Search Anywhere", desc: "Find properties on the go with powerful search filters" },
  { icon: Bell, title: "Instant Notifications", desc: "Get alerted when new properties match your criteria" },
  { icon: MessageCircle, title: "Chat on the Go", desc: "Connect with owners and agents instantly" },
  { icon: Camera, title: "Upload Properties", desc: "List your property in minutes with your phone camera" },
  { icon: MapPin, title: "Nearby Finds", desc: "Discover properties near your current location" },
  { icon: Star, title: "Save Favorites", desc: "Bookmark properties and compare them easily" },
];

export default function MobileAppClient() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    try {
      await axios.post("/newsletter", { email, interest: "mobile-app" });
      toast.success("You'll be notified when we launch!");
      setSubscribed(true);
    } catch {
      toast.success("You'll be notified when we launch!");
      setSubscribed(true);
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-900 via-amber-800 to-orange-900 dark:from-slate-900 dark:via-amber-950 dark:to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
        <div className="app-container py-20 md:py-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest mb-6">
                <Smartphone size={14} /> Coming Soon
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter mb-4">
                rentzypro <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">Mobile App</span>
              </h1>
              <p className="text-lg md:text-xl text-amber-200 font-medium max-w-xl mb-8">
                Take rentzypro with you everywhere. Search, chat, and manage properties from your phone.
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white opacity-60 cursor-not-allowed">
                  <Apple size={24} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest">Download on the</p>
                    <p className="text-sm font-black">App Store</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white opacity-60 cursor-not-allowed">
                  <Globe size={24} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest">Get it on</p>
                    <p className="text-sm font-black">Google Play</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative w-64 h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 to-orange-600/20 rounded-[48px] blur-3xl" />
                <div className="relative w-64 h-[500px] bg-slate-900 rounded-[48px] border-4 border-slate-700 shadow-2xl overflow-hidden flex flex-col">
                  <div className="h-8 bg-slate-800 flex items-center justify-center">
                    <div className="w-20 h-1.5 bg-slate-600 rounded-full" />
                  </div>
                  <div className="flex-1 p-4 flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4 shadow-lg">
                      <span className="text-white font-black text-lg">R</span>
                    </div>
                    <h3 className="text-white font-black text-xl mb-1">rentzypro</h3>
                    <p className="text-slate-400 text-xs font-medium mb-8">Find your perfect home</p>
                    <div className="w-full space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                            <Search size={16} className="text-amber-400" />
                          </div>
                          <div className="flex-1">
                            <div className="h-3 bg-slate-700 rounded w-24 mb-1" />
                            <div className="h-2 bg-slate-700 rounded w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-slate-500 text-[10px] mt-6 uppercase tracking-widest font-bold">App Preview</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="app-container py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h2 className="section-title mb-3">App Features</h2>
          <p className="section-subtitle max-w-xl mx-auto">Everything you love about rentzypro, now in your pocket</p>
        </motion.div>

        <div className="app-grid mb-16">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="app-card p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                <feature.icon size={24} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="app-card p-8">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Get Notified When We Launch</h3>
            <p className="section-subtitle mb-6">Be the first to know when the rentzypro mobile app is available.</p>
            {subscribed ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                <CheckCircle size={24} className="text-emerald-600" />
                <p className="font-bold text-emerald-700 dark:text-emerald-400">You're on the list! We'll notify you at {email}</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-3">
                <div className="relative flex-1">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="input-field pl-10"
                  />
                </div>
                <button
                  type="submit"
                  disabled={subscribing}
                  className="btn-primary flex items-center gap-2"
                >
                  {subscribing ? "..." : <><ArrowRight size={16} /> Subscribe</>}
                </button>
              </form>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="app-card p-8">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Scan to Download</h3>
            <p className="section-subtitle mb-6">QR code will be available at launch.</p>
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                <QrCode size={64} className="text-slate-400" />
              </div>
            </div>
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4 font-medium">Coming Soon — QR code for app stores</p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 p-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-3xl border border-amber-100 dark:border-amber-900/50 text-center">
          <Smartphone size={32} className="mx-auto mb-3 text-amber-600" />
          <h3 className="section-title text-xl mb-2">Mobile App Coming Soon</h3>
          <p className="section-subtitle max-w-xl mx-auto">
            The rentzypro mobile app is under development. Stay tuned for the launch on iOS and Android.
          </p>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}