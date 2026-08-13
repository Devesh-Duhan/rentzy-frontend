"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Users, Zap, ChevronRight, Star, Plus, MessageCircle, DollarSign, HelpCircle, Camera, Home } from "lucide-react";
import Link from "next/link";
import axios from "@/lib/axios";
import Footer from "@/components/Footer";

const benefits = [
  {
    icon: <Zap className="text-amber-500" size={28} />,
    title: "Free Listing",
    description: "List your property absolutely free with no hidden charges. Pay only when you close the deal.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: <Users className="text-indigo-500" size={28} />,
    title: "Wide Reach",
    description: "Get instant visibility among thousands of verified buyers actively looking for properties.",
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    icon: <ShieldCheck className="text-emerald-500" size={28} />,
    title: "Quick Sale",
    description: "Our smart matching algorithm connects you with serious buyers, helping you close deals faster.",
    gradient: "from-emerald-500 to-teal-600",
  },
];

const steps = [
  {
    number: "01",
    title: "List Your Property",
    description: "Fill in the details about your property including photos, price, and location. Takes only 5 minutes.",
    icon: <Camera size={32} />,
  },
  {
    number: "02",
    title: "Get Qualified Leads",
    description: "Receive direct inquiries from verified buyers who are genuinely interested in your property.",
    icon: <MessageCircle size={32} />,
  },
  {
    number: "03",
    title: "Close the Deal",
    description: "Negotiate directly with buyers without middlemen. Complete transparency throughout the process.",
    icon: <ShieldCheck size={32} />,
  },
  {
    number: "04",
    title: "Get Paid",
    description: "Finalize the sale and receive payment securely. We're with you every step of the way.",
    icon: <DollarSign size={32} />,
  },
];

const faqItems = [
  {
    question: "Is it free to list my property?",
    answer: "Yes, listing your property on rentzypro is completely free. There are no upfront charges or hidden fees.",
  },
  {
    question: "How do I get started?",
    answer: "Simply click on 'Post Your Property' and fill in the details. Our team will verify and publish your listing within 24 hours.",
  },
  {
    question: "How are buyers verified?",
    answer: "We verify buyers through their registered mobile numbers and email addresses. Serious buyers with complete profiles are prioritized.",
  },
  {
    question: "Can I edit my listing after posting?",
    answer: "Yes, you can edit your listing anytime from your dashboard. Update photos, price, description, or mark it as sold.",
  },
  {
    question: "How long does it take to sell?",
    answer: "The timeline varies depending on location, price, and market conditions. On average, properties get inquiries within the first week.",
  },
  {
    question: "What kind of properties can I list?",
    answer: "You can list any type of residential or commercial property including apartments, villas, plots, offices, shops, and PG accommodations.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

function TestimonialCard({ name, location: loc, text, rating }) {
  const location = typeof loc === "object" && loc !== null ? (loc.city || loc.address || "") : loc || "";
  return (
    <motion.div
      variants={itemVariants}
      className="app-card p-6 card-shadow hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-600"}
          />
        ))}
      </div>
      <p className="text-slate-600 dark:text-slate-300 font-medium text-sm leading-relaxed mb-6">&ldquo;{text}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{name}</p>
          <p className="text-xs font-medium text-slate-400">{location || ""}</p>
        </div>
      </div>
    </motion.div>
  );
}

function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="app-card overflow-hidden">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-5 text-left bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-900 dark:text-white pr-4">{question}</span>
        <HelpCircle
          size={18}
          className={`text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180 text-indigo-500" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="px-5 pb-5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function SellClient() {
  const { data: testimonialsData, isLoading: testimonialsLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const response = await axios.get("/testimonials");
      return response.data.testimonials || response.data || [];
    },
  });

  const [openFaq, setOpenFaq] = useState(null);

  const testimonials = Array.isArray(testimonialsData) ? testimonialsData : [];

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <section className="hero-section bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="hero-overlay" />
        <div className="app-container relative z-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-6">
              <Home size={14} /> Sell With Confidence
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter mb-6">
              Sell Your Property{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Faster & Easier</span>
            </h1>
            <p className="section-subtitle !text-slate-300 !text-lg md:!text-xl max-w-2xl mx-auto mb-10">
              List your property for free and connect directly with verified buyers. No middlemen, no commission.
            </p>
            <Link
              href="/add"
              className="btn-primary inline-flex items-center gap-3 !px-8 !py-4 !rounded-2xl text-sm !font-bold uppercase tracking-widest active:scale-95"
            >
              <Plus size={18} />
              Post Your Property
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="app-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-4">
              Why Choose Us
            </span>
            <h2 className="section-title !text-3xl md:!text-5xl mb-2">
              Benefits of{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Selling with Us</span>
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="app-card p-8 card-shadow hover:-translate-y-2 transition-all duration-500"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                  <div className="text-white">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{benefit.title}</h3>
                <p className="section-subtitle text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-slate-100 dark:bg-slate-900/50">
        <div className="app-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-4">
              How It Works
            </span>
            <h2 className="section-title !text-3xl md:!text-5xl mb-2">
              Sell in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">4 Simple Steps</span>
            </h2>
          </motion.div>

          <div className="relative">
            <div className="hidden lg:block absolute top-24 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 dark:from-indigo-800 dark:via-purple-800 dark:to-indigo-800" />

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="relative flex flex-col items-center text-center group"
                >
                  <div className="relative z-10 w-16 h-16 rounded-2xl app-card shadow-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-600 dark:group-hover:text-white transition-all duration-300">
                    {step.icon}
                  </div>
                  <span className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-2">
                    Step {step.number}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{step.title}</h3>
                  <p className="section-subtitle text-sm leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="app-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-4">
              Testimonials
            </span>
            <h2 className="section-title !text-3xl md:!text-5xl mb-2">
              What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Sellers Say</span>
            </h2>
          </motion.div>

          {testimonialsLoading ? (
            <div className="app-grid">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="app-card p-6 animate-pulse">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700" />
                    ))}
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12">
              <p className="section-subtitle">Testimonials coming soon.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="app-grid"
            >
              {testimonials.slice(0, 6).map((t, i) => (
                <TestimonialCard
                  key={t._id || i}
                  name={t.name || "Anonymous"}
                  location={t.location || ""}
                  text={t.text || t.comment || ""}
                  rating={t.rating || 5}
                />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <section className="py-20 md:py-28 bg-slate-100 dark:bg-slate-900/50">
        <div className="app-container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-4">
              FAQ
            </span>
            <h2 className="section-title !text-3xl md:!text-5xl mb-2">
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Questions</span>
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-3"
          >
            {faqItems.map((faq, i) => (
              <motion.div key={i} variants={itemVariants}>
                <FAQItem
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="app-container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[40px] p-12 md:p-16 text-center shadow-2xl"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDYiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
            <div className="relative z-10">
              <h2 className="section-title !text-white !text-3xl md:!text-5xl mb-6">
                Ready to Sell Your Property?
              </h2>
              <p className="section-subtitle !text-indigo-200 !text-lg max-w-2xl mx-auto mb-10">
                Join thousands of sellers who have successfully sold their properties on rentzypro. Start your listing today.
              </p>
              <Link
                href="/add"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-indigo-700 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-indigo-50 hover:shadow-2xl hover:shadow-indigo-900/30 transition-all active:scale-95"
              >
                <Plus size={18} />
                Post Your Property
                <ChevronRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
