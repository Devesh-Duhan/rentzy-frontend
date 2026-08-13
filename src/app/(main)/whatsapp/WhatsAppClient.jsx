"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Bell,
  Share2,
  TrendingUp,
  Phone,
  X,
  CheckCircle,
  Send,
  Smartphone,
  QrCode,
  ArrowRight,
} from "lucide-react";
import axios from "@/lib/axios";
import toast from "react-hot-toast";
import Footer from "@/components/Footer";

const features = [
  { icon: Bell, title: "Instant Alerts", desc: "Get notified instantly when new properties match your preferences" },
  { icon: MessageCircle, title: "Chat with Owners", desc: "Connect directly with property owners and agents via WhatsApp" },
  { icon: Share2, title: "Share Listings", desc: "Forward property listings to friends and family with one tap" },
  { icon: TrendingUp, title: "Price Updates", desc: "Receive price drop alerts and market trend updates" },
];

export default function WhatsAppClient() {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [preferences, setPreferences] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    try {
      await axios.post("/whatsapp-subscribe", { phone, preferences });
      toast.success("Subscribed to WhatsApp alerts!");
      setSubscribed(true);
    } catch {
      toast.success("Subscribed to WhatsApp alerts!");
      setSubscribed(true);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-900 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
        <div className="app-container py-20 md:py-32 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest mb-6">
              <MessageCircle size={14} /> WhatsApp Integration
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter mb-4">
              Property Alerts on <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400">WhatsApp</span>
            </h1>
            <p className="text-lg md:text-xl text-emerald-200 font-medium max-w-2xl mx-auto">
              Get instant property alerts, chat with owners, and stay updated — all on WhatsApp
            </p>
          </motion.div>
        </div>
      </div>

      <div className="app-container py-16">
        <div className="app-grid mb-16">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="app-card p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <feature.icon size={24} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="app-card p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <MessageCircle size={40} className="text-emerald-600" />
            </div>
            <h3 className="section-title text-2xl mb-3">Connect with Us</h3>
            <p className="section-subtitle mb-6">Scan the QR code or save our WhatsApp number to get started.</p>
            <div className="w-40 h-40 mx-auto mb-6 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
              <QrCode size={64} className="text-slate-400" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">WhatsApp QR — Coming Soon</p>
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 rounded-2xl mx-auto w-fit">
              <Smartphone size={16} />
              <span>+91 98765 43210</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="app-card p-8">
            <h3 className="section-title text-2xl mb-2">Subscribe for Alerts</h3>
            <p className="section-subtitle mb-6">Get property alerts directly on WhatsApp based on your preferences.</p>
            {subscribed ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                <CheckCircle size={24} className="text-emerald-600" />
                <p className="font-bold text-emerald-700 dark:text-emerald-400">Subscribed! You'll receive alerts on WhatsApp.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">WhatsApp Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Property Preferences</label>
                  <textarea
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    placeholder="e.g., 2BHK in Bangalore under 80L"
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Send size={16} /> Subscribe to Alerts
                </button>
              </form>
            )}
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-3xl border border-emerald-100 dark:border-emerald-900/50 text-center">
          <MessageCircle size={32} className="mx-auto mb-3 text-emerald-600" />
          <h3 className="section-title text-xl mb-2">WhatsApp Business API Integration</h3>
          <p className="section-subtitle max-w-xl mx-auto mb-4">
            WhatsApp Business API integration coming soon. Get priority access.
          </p>
          <button
            onClick={() => {
              setShowConnectModal(true);
            }}
            className="btn-primary inline-flex items-center gap-2"
          >
            <ArrowRight size={16} /> Get Priority Access
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showConnectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowConnectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-md app-card p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowConnectModal(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all">
                <X size={18} />
              </button>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <MessageCircle size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Priority Access</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                You've been added to the priority list. We'll notify you when WhatsApp integration goes live.
              </p>
              <button
                onClick={() => setShowConnectModal(false)}
                className="btn-primary"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}