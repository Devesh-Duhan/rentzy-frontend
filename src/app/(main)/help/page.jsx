"use client";

import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Search, HelpCircle, Book, MessageSquare, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HelpCenter() {
  const faqs = [
    {
      q: "How to post a property on rentzypro?",
      a: "Login to your account, click on 'Add Property' button in the navbar, fill in the details, upload images, and submit. Our team will verify it within 24 hours."
    },
    {
      q: "Are there any hidden charges?",
      a: "No, rentzypro is a direct platform. We do not charge any brokerage. Some premium listings might require a small verification fee."
    },
    {
      q: "How can I contact the owner directly?",
      a: "Once you find a property you like, click on 'Contact Owner' or 'View Details'. You will see the direct contact information of the owner."
    },
    {
      q: "Is my data secure?",
      a: "Absolutely. We use industry-standard encryption to protect your data and never share your contact details with third-party marketers."
    }
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="app-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="section-title text-3xl md:text-5xl lg:text-6xl !leading-tight mb-4">
              How can we <span className="text-indigo-600">help you?</span>
            </h1>
            <p className="section-subtitle text-base md:text-lg max-w-2xl mx-auto mb-8">
              Search our help center for articles, guides, and frequently asked questions about rentzypro.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search for articles, guides..."
              className="input-field pl-11 py-3.5"
            />
          </motion.div>
        </div>
      </section>

      {/* Support Categories */}
      <section className="pb-16">
        <div className="app-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: Book, title: "Getting Started", desc: "Learn the basics of using rentzypro as a tenant or owner.", color: "indigo" },
              { icon: Shield, title: "Trust & Safety", desc: "Your safety is our priority. Learn how we keep you protected.", color: "emerald" },
              { icon: MessageSquare, title: "Contact Support", desc: "Need direct help? Reach out to our 24/7 support team.", color: "rose" },
            ].map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="app-card p-6 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 bg-${cat.color}-50 dark:bg-${cat.color}-500/10 rounded-xl flex items-center justify-center text-${cat.color}-600 mb-4`}>
                  <cat.icon size={24} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{cat.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{cat.desc}</p>
                <button className="flex items-center gap-1.5 text-indigo-600 font-semibold text-sm">
                  Read More <ArrowRight size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-muted/50 dark:bg-slate-900/30">
        <div className="app-container max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="section-title mb-2">Frequently Asked Questions</h2>
            <p className="section-subtitle">Quick answers to the most common questions.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="app-card p-5"
              >
                <h4 className="font-semibold text-foreground mb-2 flex items-start gap-3">
                  <HelpCircle className="text-indigo-600 mt-0.5 shrink-0" size={18} /> {faq.q}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed ml-8">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
