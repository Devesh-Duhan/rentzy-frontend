"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, Heart, ShieldCheck, ChevronRight } from "lucide-react";
import axios from "@/lib/axios";

const Footer = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await axios.get("/categories");
        const list = Array.isArray(data) ? data : data?.data || data?.categories || [];
        setCategories(list.slice(0, 6));
      } catch (e) {
        // fallback
      }
    };
    fetchCats();
  }, []);
  return (
    <footer className="bg-slate-900 dark:bg-black text-slate-300 relative overflow-hidden">
      {/* Top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 pb-24 md:pb-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 sm:gap-8 mb-6 sm:mb-12">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                <span className="text-white text-xs font-black">R</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-white tracking-tight">Rentzy<span className="text-indigo-400">Pro</span></span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-3 sm:mb-5 max-w-sm">
              Direct owner-to-tenant property marketplace with zero brokerage and verified listings.
            </p>
            <div className="flex items-center gap-2 sm:gap-3">
              {[
                { icon: "fa-instagram", href: "https://www.instagram.com/rentzypro" },
                { icon: "fa-facebook-f", href: "#" },
                { icon: "fa-twitter", href: "#" },
                { icon: "fa-telegram", href: "https://t.me/+45BY7w9HZrtkZDZl" },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-7 h-7 sm:w-9 sm:h-9 bg-slate-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all text-xs sm:text-sm"
                  aria-label="Social media link"
                >
                  <i className={`fab ${s.icon}`} />
                </a>
              ))}
            </div>
          </div>

          {[
            {
              title: "Quick Links",
              links: [
                { label: "Buy Property", href: "/buy" },
                { label: "Rent Property", href: "/rent" },
                { label: "Sell Property", href: "/sell" },
                { label: "Featured Properties", href: "/featured-properties" },
                { label: "Blog & Insights", href: "/blog" },
              ],
            },
            {
              title: "Categories",
              links: categories.length > 0
                ? categories.map((c) => ({
                    label: c.name,
                    href: `/category/${c.slug || c.name.toLowerCase().replace(/\s+/g, "-")}`,
                  }))
                : [
                    { label: "Residential", href: "/category/residential" },
                    { label: "Commercial", href: "/category/commercial" },
                    { label: "Land / Plots", href: "/category/land" },
                    { label: "PG / Hostel", href: "/category/pg-hostel" },
                  ],
            },
            {
              title: "Support",
              links: [
                { label: "Help Center", href: "/help" },
                { label: "Safety Tips", href: "/safety" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Contact Us", href: "/contact" },
              ],
            },
          ].map((section) => (
            <div key={section.title} className="min-w-0">
              <h4 className="text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-4">{section.title}</h4>
              <ul className="space-y-1.5 sm:space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors truncate block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 sm:pt-6 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-2.5 sm:gap-4">
          <p className="text-[10px] sm:text-xs text-slate-500 text-center md:text-left">
            &copy; 2026 RentzyPro. All rights reserved. Made with <span className="text-rose-500">&hearts;</span> in India.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[10px] sm:text-xs text-slate-400">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <span className="text-slate-700">•</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span className="text-slate-700">•</span>
            <Link href="/refund-policy" className="hover:text-white transition-colors">Refund</Link>
            <span className="text-slate-700">•</span>
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
