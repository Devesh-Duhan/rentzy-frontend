"use client";

import { useState } from "react";
import ContentSkeleton from "@/components/ContentSkeleton";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarPlus,
  Clock,
  Eye,
  Share2,
  Bookmark,
  Check,
  Tag,
  BookOpen,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import Footer from "@/components/Footer";
import axiosInstance from "@/lib/axios";

export default function SingleBlogPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;

  const [isCopied, setIsCopied] = useState(false);
  const { data: blog, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["publicBlog", slug],
    queryFn: async () => (await axiosInstance.get(`/blogs/${slug}`)).data?.data || null,
    enabled: !!slug,
  });
  const { data: relatedData, isLoading: relatedLoading } = useQuery({
    queryKey: ["publicBlogs-related"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/blogs?limit=3");
      return Array.isArray(data) ? data : data?.data || [];
    },
    enabled: !!blog,
  });
  const relatedBlogs = (relatedData || []).filter((item) => item._id !== blog?._id).slice(0, 3);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (isLoading || (isError && error?.response?.status !== 404 && !blog)) {
    return <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 md:pt-36 pb-20">
      <div className="app-container max-w-4xl">
        <Link href="/blog" className="inline-flex items-center gap-2 mb-8 text-sm font-bold text-indigo-600"><ArrowLeft size={16} /> Back to All Articles</Link>
        {isError ? <div role="alert"><h1 className="text-2xl font-bold mb-4">Could not load this article</h1><button onClick={() => refetch()} className="btn-secondary">Try again</button></div> : <ContentSkeleton label="Loading article" count={3} itemClassName="h-40" />}
      </div>
    </main>;
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 mx-auto mb-4">
            <BookOpen size={36} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Article Not Found
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            The article you are looking for may have been moved, unpublished, or does not exist.
          </p>
          <Link
            href="/blog"
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all inline-block shadow-lg"
          >
            ← Explore Knowledge Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="pb-32 pt-28 md:pt-36">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider"
            >
              <ArrowLeft size={16} /> Back to All Articles
            </Link>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-indigo-500 transition-all shadow-sm active:scale-95"
            >
              {isCopied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
              <span>{isCopied ? "Link Copied!" : "Share Article"}</span>
            </button>
          </div>

          {/* Article Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mb-8"
          >
            {/* Category pills & featured badge */}
            <div className="flex items-center gap-2 flex-wrap">
              {blog.featured && (
                <span className="px-3 py-1 bg-amber-400 text-amber-950 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <TrendingUp size={13} /> Featured
                </span>
              )}
              {Array.isArray(blog.categories) &&
                blog.categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-100 dark:border-indigo-500/20"
                  >
                    {cat}
                  </span>
                ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {blog.title}
            </h1>

            {/* Author and Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200/60 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-base shadow-md">
                  {(blog.author?.name || "A").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {blog.author?.name || "Editorial Team"}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">Verified Author & Real Estate Advisor</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CalendarPlus size={14} />
                  {blog.publishDate
                    ? new Date(blog.publishDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Recent"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-mono">
                  <Clock size={14} /> {blog.readingTime || 4} min read
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-mono">
                  <Eye size={14} /> {(blog.views || 1).toLocaleString()} views
                </span>
              </div>
            </div>
          </motion.div>

          {/* Cover Hero Banner */}
          {blog.coverImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-white/10 mb-10 h-[300px] sm:h-[420px] bg-slate-100 dark:bg-slate-900"
            >
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          {/* Excerpt Lead */}
          {blog.excerpt && (
            <div className="p-6 rounded-2xl bg-indigo-50/60 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 text-slate-700 dark:text-slate-300 font-medium text-base sm:text-lg leading-relaxed mb-8">
              {blog.excerpt}
            </div>
          )}

          {/* Article Full Body */}
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-base sm:text-lg leading-relaxed space-y-6">
            {blog.content ? (
              blog.content.split("\n\n").map((paragraph, index) => (
                <p key={index} className="whitespace-pre-line leading-relaxed">
                  {paragraph}
                </p>
              ))
            ) : (
              <p>No content provided for this article.</p>
            )}
          </div>

          {/* Tags */}
          {Array.isArray(blog.tags) && blog.tags.length > 0 && (
            <div className="mt-12 pt-6 border-t border-slate-200/60 dark:border-white/5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Related Topics & Tags
              </span>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((t) => (
                  <span
                    key={t}
                    className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Articles Section */}
          {relatedLoading && <ContentSkeleton label="Loading related articles" className="app-grid mt-12" itemClassName="h-48" />}
          {relatedBlogs.length > 0 && (
            <div className="mt-16 pt-12 border-t border-slate-200 dark:border-white/10">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
                Recommended Articles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedBlogs.map((rel) => (
                  <Link
                    key={rel._id}
                    href={`/blog/${rel.slug || rel._id}`}
                    className="group bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-indigo-500 transition-all flex flex-col"
                  >
                    <div className="h-32 rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
                      <img
                        src={
                          rel.coverImage ||
                          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60"
                        }
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {rel.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
