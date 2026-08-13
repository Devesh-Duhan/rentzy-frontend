"use client";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Shield, Eye, Lock, AlertTriangle } from "lucide-react";

export default function SafetyTips() {
  const tips = [
    {
      title: "Verifying the Owner",
      desc: "Always ask for proof of ownership before making any payment. A legitimate owner will be happy to show you the title deed or electricity bill.",
      icon: Eye,
      color: "indigo"
    },
    {
      title: "Avoid Pre-Viewing Payments",
      desc: "Never pay security deposits or 'booking fees' before you have physically visited the property and met the owner in person.",
      icon: AlertTriangle,
      color: "rose"
    },
    {
      title: "Direct Transactions",
      desc: "All transactions happen directly between you and the property owner. Be cautious and use secure bank transfers or verifiable methods.",
      icon: Lock,
      color: "emerald"
    },
    {
      title: "Trust Your Instincts",
      desc: "If a deal seems too good to be true, it probably is. Premium properties at suspiciously low prices are often bait for scams.",
      icon: Shield,
      color: "amber"
    }
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16 text-center">
        <div className="app-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="pill bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/50 mb-6">
              <Shield size={14} /> Safety First
            </span>
            <h1 className="section-title text-3xl md:text-5xl lg:text-6xl !leading-tight mb-4 mt-4">
              Safety <span className="text-rose-500">Guidelines</span>
            </h1>
            <p className="section-subtitle text-base md:text-lg max-w-2xl mx-auto">
              At Seenu Property, your safety is important. Follow these tips to ensure a secure dealing experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="pb-16 md:pb-24">
        <div className="app-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {tips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="app-card p-6 md:p-8 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-${tip.color}-50 dark:bg-${tip.color}-500/10 rounded-xl flex items-center justify-center text-${tip.color}-600 mb-5`}>
                  <tip.icon size={28} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">{tip.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tip.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Report Section */}
      <section className="py-16 bg-foreground dark:bg-black/60 relative overflow-hidden">
        <div className="app-container max-w-4xl text-center relative z-10 text-white">
          <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-500/20">
            <AlertTriangle size={32} />
          </div>
          <h2 className="section-title text-white text-2xl md:text-3xl mb-4">Report Suspicious Activity</h2>
          <p className="text-white/60 text-base mb-8 max-w-xl mx-auto">
            Encountered something suspicious? Our safety team is ready to investigate. Help us keep Seenu Property safe.
          </p>
          <button className="btn-primary bg-rose-500 hover:bg-rose-600">
            Report Listing
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
