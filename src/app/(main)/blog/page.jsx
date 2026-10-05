"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Compass,
  CalendarPlus,
  ArrowRight,
  TrendingUp,
  Clock,
  Eye,
  User,
  Tag,
  BookOpen,
  Sparkles,
} from "lucide-react";
import Footer from "@/components/Footer";
import axiosInstance from "@/lib/axios";

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const { data } = await axiosInstance.get("/blogs");
        const list = Array.isArray(data) ? data : data.data || data.blogs || [];
        setBlogs(list);
      } catch (err) {
        console.error("Failed to load blogs on frontend:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Extract unique categories across blogs
  const categories = useMemo(() => {
    const set = new Set();
    blogs.forEach((b) => {
      if (Array.isArray(b.categories)) {
        b.categories.forEach((c) => set.add(c));
      }
    });
    return ["All", ...Array.from(set)];
  }, [blogs]);

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const q = search.toLowerCase();
      const matchesSearch =
        b.title?.toLowerCase().includes(q) ||
        b.excerpt?.toLowerCase().includes(q) ||
        (Array.isArray(b.categories) && b.categories.some((c) => c.toLowerCase().includes(q))) ||
        (Array.isArray(b.tags) && b.tags.some((t) => t.toLowerCase().includes(q)));

      const matchesCat =
        selectedCategory === "All" ||
        (Array.isArray(b.categories) && b.categories.includes(selectedCategory));

      return matchesSearch && matchesCat;
    });
  }, [blogs, search, selectedCategory]);

  // Featured hero blog
  const featuredBlog = useMemo(() => {
    return blogs.find((b) => b.featured) || blogs[0] || null;
  }, [blogs]);

  // Remaining articles (excluding featured)
  const remainingBlogs = useMemo(() => {
    if (!featuredBlog) return filteredBlogs;
    return filteredBlogs.filter((b) => b._id !== featuredBlog._id);
  }, [filteredBlogs, featuredBlog]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="pb-32 pt-28 md:pt-36">
        <div className="app-container">
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-semibold uppercase tracking-widest mb-4 border border-indigo-100 dark:border-indigo-500/20">
                <Compass size={14} /> Knowledge Hub & Market Insights
              </div>
              <h1 className="section-title text-3xl md:text-5xl tracking-tight">
                Rentzy<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Pro Blog</span>
              </h1>
              <p className="section-subtitle max-w-2xl text-slate-500 dark:text-slate-400 mt-2">
                Expert insights, market trends, tenant advice, and practical guides to help you navigate the modern real estate landscape without brokers.
              </p>
            </motion.div>

            {/* Search Input */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full md:w-80 relative"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles, topics..."
                className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-700 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all"
              />
            </motion.div>
          </div>

          {/* Category Filter Chips */}
          {categories.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 custom-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/10 hover:border-indigo-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="py-24 text-center">
              <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Loading Latest Insights...
              </p>
            </div>
          ) : blogs.length === 0 ? (
            /* Empty State */
            <div className="py-24 text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-600 mx-auto mb-4">
                <BookOpen size={36} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                No Articles Published Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Stay tuned! New real estate market articles and rental guides will be published soon.
              </p>
              <Link
                href="/"
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-all inline-block shadow-lg"
              >
                ← Back to Homepage
              </Link>
            </div>
          ) : (
            <>
              {/* Featured Hero Article Banner */}
              {featuredBlog && selectedCategory === "All" && !search && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-12 group"
                >
                  <Link href={`/blog/${featuredBlog.slug || featuredBlog._id}`}>
                    <div className="relative h-[320px] md:h-[460px] rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-white/10 cursor-pointer">
                      <img
                        src={
                          featuredBlog.coverImage ||
                          "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1600&q=80"
                        }
                        alt={featuredBlog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                          <span className="px-3.5 py-1 bg-amber-400 text-amber-950 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                            <TrendingUp size={14} /> Featured Article
                          </span>
                          {Array.isArray(featuredBlog.categories) && featuredBlog.categories[0] && (
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-bold uppercase tracking-wider">
                              {featuredBlog.categories[0]}
                            </span>
                          )}
                          <span className="text-white/80 text-xs font-medium flex items-center gap-1.5">
                            <Clock size={14} /> {featuredBlog.readingTime || 4} min read
                          </span>
                        </div>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-3 leading-tight max-w-4xl group-hover:text-indigo-200 transition-colors tracking-tight">
                          {featuredBlog.title}
                        </h2>
                        {featuredBlog.excerpt && (
                          <p className="text-white/80 text-sm md:text-base max-w-3xl line-clamp-2 mb-6 hidden sm:block">
                            {featuredBlog.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-white">
                          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center border-2 border-white/20 shadow-md">
                            {(featuredBlog.author?.name || "A").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-white">
                              {featuredBlog.author?.name || "Editorial Team"}
                            </p>
                            <p className="text-[11px] text-white/60 font-medium">
                              {featuredBlog.publishDate
                                ? new Date(featuredBlog.publishDate).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "Recent Article"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Grid of Remaining Articles */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {(selectedCategory !== "All" || search ? filteredBlogs : remainingBlogs).map(
                  (post) => (
                    <motion.div
                      key={post._id || post.id}
                      variants={itemVariants}
                      className="group bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1.5 flex flex-col h-full overflow-hidden"
                    >
                      <Link
                        href={`/blog/${post.slug || post._id}`}
                        className="flex flex-col h-full"
                      >
                        {/* Thumbnail */}
                        <div className="h-52 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <img
                            src={
                              post.coverImage ||
                              "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60"
                            }
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {Array.isArray(post.categories) && post.categories.length > 0 && (
                            <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider shadow-sm">
                              {post.categories[0]}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-3">
                            <span className="flex items-center gap-1">
                              <CalendarPlus size={13} />
                              {post.publishDate
                                ? new Date(post.publishDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : post.createdAt
                                ? new Date(post.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "Recent"}
                            </span>
                            <span className="flex items-center gap-1 font-mono">
                              <Clock size={13} />
                              {post.readingTime || 3} min
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2.5 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                            {post.title}
                          </h3>

                          {post.excerpt && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 line-clamp-3 leading-relaxed">
                              {post.excerpt}
                            </p>
                          )}

                          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 text-[10px] font-black flex items-center justify-center">
                                {(post.author?.name || "A").charAt(0).toUpperCase()}
                              </div>
                              <span className="truncate max-w-[110px]">
                                {post.author?.name || "Admin"}
                              </span>
                            </span>

                            <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold text-xs group-hover:translate-x-1 transition-transform">
                              Read Article <ArrowRight size={13} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                )}
              </motion.div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
