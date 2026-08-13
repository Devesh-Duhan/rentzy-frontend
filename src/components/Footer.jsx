import Link from "next/link";
import { Home, Heart, ShieldCheck, ChevronRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 dark:bg-black text-slate-300 relative overflow-hidden">
      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {/* App Download CTA */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 md:p-12 mb-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Get the RentzyPro App</h3>
              <p className="text-white/80 text-sm md:text-base">Find properties on the go. Download now!</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-black/30 hover:bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3 transition-all">
                <i className="fab fa-apple text-xl" />
                <div className="text-left">
                  <p className="text-[9px] text-white/70">Download on</p>
                  <p className="text-sm font-semibold">App Store</p>
                </div>
              </button>
              <button className="flex items-center gap-2 bg-black/30 hover:bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3 transition-all">
                <i className="fab fa-google-play text-xl" />
                <div className="text-left">
                  <p className="text-[9px] text-white/70">Get it on</p>
                  <p className="text-sm font-semibold">Google Play</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xs font-black">R</span>
              </div>
              <span className="text-lg font-bold text-white">Rentzy<span className="text-indigo-400">Pro</span></span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              India's most trusted property marketplace connecting owners directly with buyers and tenants.
            </p>
            <div className="flex gap-3">
              {[
                { icon: "fa-instagram", href: "https://www.instagram.com/rentzypro" },
                { icon: "fa-facebook-f", href: "#" },
                { icon: "fa-twitter", href: "#" },
                { icon: "fa-telegram", href: "https://t.me/+45BY7w9HZrtkZDZl" },
              ].map((s, i) => (
                <a key={i} href={s.href} className="w-9 h-9 bg-slate-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all">
                  <i className={`fab ${s.icon} text-sm`} />
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
              ],
            },
            {
              title: "Categories",
              links: [
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
            <div key={section.title}>
              <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            &copy; 2026 RentzyPro. All rights reserved. Made with <span className="text-rose-500">&hearts;</span> in India.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
