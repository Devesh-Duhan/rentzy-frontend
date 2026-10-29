"use client";

import Image from "next/image";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Users, Building2, MapPin, TrendingUp, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  const stats = [
    { label: "Happy Customers", value: "10,000+", icon: Users },
    { label: "Premium Properties", value: "5,000+", icon: Building2 },
    { label: "Cities Covered", value: "50+", icon: MapPin },
    { label: "Brokerage Saved", value: "₹50Cr+", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-24">
        {/* Hero */}
        <section className="hero-section">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
          <div className="app-container relative z-10 w-full">
            <div className="max-w-3xl mx-auto text-center pt-20 md:pt-32 pb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="pill bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50 mb-6">
                  Our Story
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="section-title text-4xl md:text-6xl lg:text-7xl !leading-tight mb-6"
              >
                Revolutionizing <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">Real Estate</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="section-subtitle text-base md:text-lg max-w-2xl mx-auto"
              >
                rentzypro was founded on a simple principle: finding a home shouldn't be stressful, and it definitely shouldn't cost you an entire month's rent in hidden brokerage fees.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="app-container -mt-10 relative z-20 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 md:p-8 rounded-2xl glass-effect"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-3 md:p-4">
                <div className="w-12 h-12 mx-auto bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-3">
                  <stat.icon size={22} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Mission */}
        <section className="app-container mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="section-title text-3xl md:text-5xl !leading-tight mb-6">Built for the <br />Modern Renter</h2>
              <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed">
                For decades, the standard real estate market heavily favored the middlemen. We built rentzypro to democratize property leasing by empowering landlords and tenants to interact directly—yielding faster decisions, absolute transparency, and immense savings.
              </p>
              <div className="space-y-5">
                 – 
                {[
                  { title: "100% Transparency", desc: "Clear property details, pricing, and rental information." },
                  { title: "Verified Listings", desc: "Every property goes through a rigorous verification process." },
                  { title: "Direct Contact", desc: "Talk directly to the owner via WhatsApp or Call." },
                  { title: "Faster Decisions", desc: "Discover properties, connect, and finalize deals quickly." }
                ].map((val, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-foreground">{val.title}</h4>
                      <p className="text-sm text-muted-foreground">{val.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-xl relative">
                <Image src="/images/owner-interior.jpg" alt="Modern living room with sofas and natural light" width={800} height={1000} sizes="(min-width: 1280px) 584px, (min-width: 768px) 50vw, 100vw" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="glass-effect p-5 rounded-xl text-white">
                    <p className="text-sm font-medium italic">"Our vision is to make moving into a new home as easy as booking a hotel."</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
