"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, X, MessageCircle, Globe, Hash, Mail, Link, Check } from "lucide-react";
import toast from "react-hot-toast";

const shareOptions = [
  {
    name: "WhatsApp",
    icon: MessageCircle,
    color: "bg-green-500 hover:bg-green-600",
    getUrl: (url) => `https://wa.me/?text=${encodeURIComponent(url)}`,
  },
  {
    name: "Facebook",
    icon: Globe,
    color: "bg-blue-600 hover:bg-blue-700",
    getUrl: (url) => `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "Twitter",
    icon: Hash,
    color: "bg-sky-500 hover:bg-sky-600",
    getUrl: (url) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
  },
  {
    name: "Email",
    icon: Mail,
    color: "bg-gray-600 hover:bg-gray-700",
    getUrl: (url) => `mailto:?body=${encodeURIComponent(url)}`,
  },
];

const ShareProperty = ({ propertyUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(propertyUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = (getUrl) => {
    const url = getUrl(propertyUrl);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all font-semibold text-sm active:scale-95"
      >
        <Share2 className="w-4 h-4" /> Share
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Share Property</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4">
                {shareOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={() => handleShare(option.getUrl)}
                    className={`${option.color} text-white rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-90`}
                  >
                    <option.icon className="w-5 h-5" />
                    <span className="text-[10px] font-bold">{option.name}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold text-sm transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" /> Copied!
                  </>
                ) : (
                  <>
                    <Link className="w-4 h-4" /> Copy Link
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShareProperty;
