"use client";

import { ShieldCheck, Shield, ShieldAlert } from "lucide-react";

const getBadge = (score) => {
  if (score >= 80) return { label: "Verified", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20", icon: ShieldCheck };
  if (score >= 50) return { label: "Trusted", color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20", icon: Shield };
  return { label: "New", color: "text-slate-500 bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20", icon: ShieldAlert };
};

export default function TrustScore({ userId, score = 0, size = "sm" }) {
  const badge = getBadge(score);
  const Icon = badge.icon;
  const isLarge = size === "lg";

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-black uppercase tracking-widest transition-all ${badge.color} ${
        isLarge ? "text-[11px]" : "text-[9px]"
      }`}
      title={`Trust Score: ${score}/100`}
    >
      <Icon size={isLarge ? 14 : 10} />
      <span>{badge.label}</span>
      <span className={`opacity-60 ${isLarge ? "ml-1" : ""}`}>({score})</span>
    </div>
  );
}
