"use client";

import Image from "next/image";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Search, Compass, CalendarPlus, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";

const blogPosts = [
  {
    id: 1,
    title: "Understanding Real Estate Markets in Hisar",
    category: "Market Trends",
    date: "April 1, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    excerpt: "An in-depth look at property value fluctuations and new development sectors coming up inside the city limits in the upcoming year.",
  },
  {
    id: 2,
    title: "5 Tips for Negotiating Rent Directly with Owners",
    category: "Tips & Guides",
    date: "March 28, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1556156653-e5a7c69cc263?auto=format&fit=crop&w=800&q=80",
    excerpt: "Learn how to bypass the middlemen broker effectively and secure a favorable rate that satisfies both you and the landlord seamlessly.",
  },
  {
    id: 3,
    title: "Why Co-Living Spaces are the Future for Students",
    category: "Lifestyle",
    date: "March 15, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    excerpt: "Discover the socio-economic benefits driving the massive surge in premium PG and Hostels tailored across major educational hubs.",
  },
  {
    id: 4,
    title: "The Ultimate Moving Out Checklist",
    category: "Tips & Guides",
    date: "March 10, 2026",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    excerpt: "Don't let your deposit get deducted. Follow this comprehensive checklist to leave your rented property perfectly spotless.",
  },
  {
    id: 5,
    title: "Commercial Property: To Buy or Rent?",
    category: "Investing",
    date: "February 22, 2026",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    excerpt: "Analyzing the math behind commercial spaces. Which model returns the best investment capability for early-stage startups?",
  },
  {
    id: 6,
    title: "Eco-Friendly Homes Are Taking Over",
    category: "Market Trends",
    date: "February 14, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    excerpt: "Why properties featuring solar layouts, rainwater harvesting, and Vastu-compliant architectures are skyrocketing in demand.",
  }
];

export default function BlogPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="pb-32 pt-28">
        <div className="app-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-semibold uppercase tracking-widest mb-4">
                <Compass size={14} /> Knowledge Hub
              </div>
              <h1 className="section-title text-3xl md:text-5xl">
                rentzypro <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Blog</span>
              </h1>
              <p className="section-subtitle max-w-2xl">
                Expert insights, market trends, and practical guides to help you navigate the modern real estate landscape without brokers.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full md:w-72 relative"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search articles..."
                className="input-field pl-11"
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12 group cursor-pointer"
          >
            <div className="relative h-[300px] md:h-[420px] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1600&q=80"
                alt="Featured"
                width={1600}
                height={420}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-amber-400 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                    <TrendingUp size={14} /> Featured
                  </span>
                  <span className="text-white/70 text-xs font-medium flex items-center gap-1.5">
                    <CalendarPlus size={14} /> April 4, 2026
                  </span>
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight max-w-3xl group-hover:text-indigo-200 transition-colors">
                  The Era of No-Brokerage Real Estate has Finally Arrived in Tier-2 Cities
                </h2>
                <div className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                    <Image src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=100&q=80" width={48} height={48} className="w-full h-full object-cover" alt="Author" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Rahul Sharma</p>
                    <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider">Lead Editor</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {blogPosts.map((post) => (
              <motion.div key={post.id} variants={itemVariants} className="group app-card overflow-hidden transition-all hover:-translate-y-1 cursor-pointer flex flex-col h-full">
                <div className="h-48 relative overflow-hidden">
                  <Image src={post.image} alt={post.title} width={800} height={256} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider shadow-sm">
                    {post.category}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-3">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1"><CalendarPlus size={12} />{post.readTime}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto">
                    <span className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                      Read Article <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-12 text-center">
            <button className="btn-primary">
              Load More Articles
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
