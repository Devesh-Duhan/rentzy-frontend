"use client";

import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Gift,
  Share2,
  Copy,
  Check,
  Link,
  Users,
  Wallet,
  Clock,
  TrendingUp,
  ExternalLink,
  MessageCircle,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";
import Footer from "@/components/Footer";

const STEPS = [
  { icon: Link, title: "Share Your Link", desc: "Share your unique referral link with friends and family." },
  { icon: Users, title: "Friend Signs Up", desc: "They register on rentzypro using your referral link." },
  { icon: Gift, title: "You Earn Rewards", desc: "Once they complete their first booking, you both earn." },
];

const HISTORY = [
  { name: "Ananya Sharma", date: "2026-07-20", status: "Rewarded", amount: "₹1,000" },
  { name: "Rahul Verma", date: "2026-07-18", status: "Active", amount: "₹1,000" },
  { name: "Priya Patel", date: "2026-07-15", status: "Pending", amount: "₹500" },
  { name: "Amit Singh", date: "2026-07-10", status: "Rewarded", amount: "₹1,000" },
  { name: "Neha Gupta", date: "2026-07-05", status: "Active", amount: "₹1,000" },
];

const STATUS_STYLES = {
  Pending: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  Active: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  Rewarded: "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400",
};

export default function ReferClient() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const referralLink = `${baseUrl}/register?ref=${user?._id || user?.id || ""}`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  }, [referralLink]);

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500 hover:bg-green-600",
      href: `https://wa.me/?text=${encodeURIComponent(`Find your dream home on rentzypro! Sign up using my link: ${referralLink}`)}`,
    },
    {
      name: "Facebook",
      icon: Send,
      color: "bg-blue-600 hover:bg-blue-700",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
    },
    {
      name: "Twitter",
      icon: TrendingUp,
      color: "bg-sky-500 hover:bg-sky-600",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Find your dream home on rentzypro! Sign up using my link: ${referralLink}`)}`,
    },
    {
      name: "Email",
      icon: ExternalLink,
      color: "bg-slate-600 hover:bg-slate-700",
      href: `mailto:?subject=${encodeURIComponent("Find your dream home on rentzypro")}&body=${encodeURIComponent(`Check out rentzypro for finding homes! Sign up using my link: ${referralLink}`)}`,
    },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <main className="pt-28 md:pt-36 pb-24">
        <div className="app-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="pill bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 mb-4">
              <Gift size={14} /> Refer & Earn
            </div>
            <h1 className="section-title">
              Refer a Friend, <span className="text-emerald-600 dark:text-emerald-400">Earn Rewards</span>
            </h1>
            <p className="section-subtitle max-w-xl">
              Share the rentzypro experience and earn rewards for every friend who signs up and completes a booking.
            </p>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="app-card p-6 md:p-8 mb-8"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {STEPS.map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 mx-auto bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-3 relative">
                    <step.icon size={24} />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Referral Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="app-card p-6 md:p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                <Link size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your Referral Link</h2>
                <p className="text-xs text-slate-400 font-medium">Share this with friends</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <Link size={14} className="text-slate-400 shrink-0" />
                <span className="text-sm text-slate-600 dark:text-slate-300 truncate">
                  {referralLink}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="btn-primary inline-flex items-center justify-center gap-2 shrink-0 bg-emerald-600 hover:bg-emerald-700"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>

            <div className="mt-6">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Share via</h3>
              <div className="flex flex-wrap gap-2">
                {shareLinks.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2.5 ${s.color} text-white rounded-xl text-sm font-medium transition-all shadow-sm`}
                  >
                    <s.icon size={15} />
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Rewards Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="app-card p-6 md:p-8 mb-8"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Your Rewards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Total Earnings", value: "₹2,500", icon: Wallet, color: "emerald" },
                { label: "Total Referrals", value: "5", icon: Users, color: "indigo" },
                { label: "Pending Rewards", value: "₹500", icon: Clock, color: "amber" },
              ].map((item) => {
                const colorMap = {
                  emerald: {
                    bg: "bg-emerald-50 dark:bg-emerald-900/20",
                    border: "border-emerald-100 dark:border-emerald-800/30",
                    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
                    iconColor: "text-emerald-600 dark:text-emerald-400",
                  },
                  indigo: {
                    bg: "bg-indigo-50 dark:bg-indigo-900/20",
                    border: "border-indigo-100 dark:border-indigo-800/30",
                    iconBg: "bg-indigo-100 dark:bg-indigo-900/40",
                    iconColor: "text-indigo-600 dark:text-indigo-400",
                  },
                  amber: {
                    bg: "bg-amber-50 dark:bg-amber-900/20",
                    border: "border-amber-100 dark:border-amber-800/30",
                    iconBg: "bg-amber-100 dark:bg-amber-900/40",
                    iconColor: "text-amber-600 dark:text-amber-400",
                  },
                };
                const style = colorMap[item.color];
                return (
                  <div
                    key={item.label}
                    className={`${style.bg} ${style.border} border rounded-2xl p-5`}
                  >
                    <div className={`w-9 h-9 ${style.iconBg} ${style.iconColor} rounded-xl flex items-center justify-center mb-3`}>
                      <item.icon size={18} />
                    </div>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{item.value}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Referral History Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="app-card p-6 md:p-8"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Referral History</h2>

            {HISTORY.length === 0 ? (
              <div className="py-12 text-center">
                <Users size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <h3 className="text-base font-semibold text-slate-700 dark:text-white">No referrals yet</h3>
                <p className="text-sm text-slate-400 mt-1">Start sharing your referral link to earn rewards!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="text-left pb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Friend Name</th>
                      <th className="text-left pb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Date</th>
                      <th className="text-left pb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                      <th className="text-right pb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Reward</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HISTORY.map((row, i) => (
                      <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                        <td className="py-3.5 text-sm font-medium text-slate-900 dark:text-white">{row.name}</td>
                        <td className="py-3.5 text-sm text-slate-500 dark:text-slate-400">
                          {new Date(row.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3.5">
                          <span className={`inline-flex text-xs font-semibold px-3 py-1 rounded-lg ${STATUS_STYLES[row.status] || STATUS_STYLES.Pending}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right text-sm font-semibold text-slate-900 dark:text-white">{row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
