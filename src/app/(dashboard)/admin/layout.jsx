"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { useSelector, useDispatch } from "react-redux";
import { logout, reset } from "@/store/slices/authSlice";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Building2,
  Bell,
  BarChart3,
  Settings,
  ShieldCheck,
  Clock,
  LogOut,
  X,
  Menu,
  Moon,
  Sun,
  Tags,
  MapPin,
  Star,
  HelpCircle,
  FileText,
  MessageSquare,
  CreditCard,
  CalendarCheck,
  Mail,
  Download,
  Folders,
  Video,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { id: "profile", label: "My Profile", icon: UserCircle, href: "/profile" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { id: "users", label: "Users", icon: Users, href: "/admin/users" },
  { id: "properties", label: "Properties", icon: Building2, href: "/admin/properties" },
  { id: "categories", label: "Categories", icon: Tags, href: "/admin/categories" },
  { id: "locations", label: "Locations", icon: MapPin, href: "/admin/locations" },
  { id: "blogs", label: "Blogs", icon: FileText, href: "/admin/blogs" },
  { id: "seo", label: "SEO", icon: FileText, href: "/admin/seo" },
  { id: "featured", label: "Featured", icon: Star, href: "/admin/featured" },
  { id: "verification", label: "Verification", icon: ShieldCheck, href: "/admin/verification" },
  { id: "activity", label: "Activity Log", icon: Clock, href: "/admin/activity" },
  { id: "testimonials", label: "Testimonials", icon: MessageSquare, href: "/admin/testimonials" },
  { id: "faqs", label: "FAQs", icon: HelpCircle, href: "/admin/faqs" },
  { id: "leads", label: "Leads", icon: MessageSquare, href: "/admin/leads" },
  { id: "plans", label: "Subscriptions", icon: CreditCard, href: "/admin/subscription-plans" },
  { id: "visits", label: "Site Visits", icon: CalendarCheck, href: "/admin/visits" },
  { id: "reviews", label: "Reviews", icon: Bell, href: "/admin/reviews" },
  { id: "newsletter", label: "Newsletter", icon: Mail, href: "/admin/newsletter" },
  { id: "exports", label: "Exports", icon: Download, href: "/admin/exports" },
  { id: "reports", label: "Reports", icon: Folders, href: "/admin/reports" },
  { id: "settings", label: "Settings", icon: Settings, href: "/admin/settings" },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const signingOut = useRef(false);

  useEffect(() => {
    if (!signingOut.current && !isLoading && (!user || user.role !== 'admin')) {
      router.push("/login");
    }
  }, [user, isLoading, router]);


  const handleLogout = async () => {
    if (signingOut.current) return;
    signingOut.current = true;
    await dispatch(logout());
    dispatch(reset());
    router.replace("/");
  };

  // Improved activeLabel logic to handle sub-paths
  const activeItem = MENU_ITEMS.find(item =>
    pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
  );
  const activeLabel = activeItem?.label || "Admin Panel";

  // Navigation state to show progress
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false); // Reset when pathname changes
  }, [pathname]);

  return (
    <div className={`min-h-screen transition-all duration-300 overflow-x-hidden ${theme === "light" ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-white"}`}>
      {/* Navigation Progress Bar */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 h-1 bg-indigo-600 z-[200] shadow-[0_0_10px_#4f46e5]"
          />
        )}
      </AnimatePresence>

      {/* Background Decorative Elements - Reduced Opacity for Performance */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5 z-50 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <BrandLogo size={32} className="h-8 w-8 rounded-lg shadow-lg" />
          <span className="font-black text-slate-900 dark:text-white tracking-tight uppercase text-[11px] sm:text-sm truncate">rentzypro Admin</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-600 dark:text-slate-400"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-white dark:bg-slate-950 z-[70] lg:hidden p-6 flex flex-col shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-10">
                <BrandLogo size={40} className="h-10 w-10 rounded-xl" />
                <span className="text-xl font-black dark:text-white">Admin Panel</span>
              </div>
              <nav className="flex-1 space-y-1">
                {MENU_ITEMS.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (pathname !== item.href) setIsNavigating(true);
                      }}
                      className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${isActive
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95 transition-all duration-100 duration-75"
                        }`}
                    >
                      <item.icon size={20} />
                      <span className="font-bold text-sm tracking-tight">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="pt-6 border-t border-slate-100 dark:border-white/5 space-y-2">
                <button onClick={toggleTheme} className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Theme</span>
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 text-rose-500 font-bold">
                  <LogOut size={20} /> Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Optimized Blur */}
      <aside className="fixed left-6 top-6 bottom-6 w-72 z-40 hidden lg:block">
        <div className="h-full bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl rounded-[40px] flex flex-col p-8 lg:p-6 transition-all">
          <div className="flex items-center gap-4 mb-12">
            <BrandLogo size={48} className="h-12 w-12 rounded-2xl shadow-xl" />
            <div>
              <Link href="/" className="text-xl font-black tracking-tight dark:text-white block hover:text-indigo-600 transition-colors">rentzypro</Link>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Master Console</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
            {MENU_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    if (pathname !== item.href) setIsNavigating(true);
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 ${isActive
                    ? "bg-slate-900 text-white dark:bg-indigo-600 shadow-xl shadow-indigo-100 dark:shadow-none translate-x-1"
                    : "text-slate-400 hover:bg-white dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-white hover:translate-x-1 border border-transparent hover:border-slate-100 dark:hover:border-white/5 active:scale-95 transition-all duration-100 duration-75"
                    }`}
                >
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-sm font-bold tracking-tight">{item.label}</span>
                  {isActive && <motion.div layoutId="activePill" className="w-1.5 h-1.5 rounded-full bg-white ml-auto" />}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 space-y-3">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:rotate-12 transition-transform">
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Environment</p>
                <p className="text-xs font-black truncate">{theme === 'light' ? 'Light Theme' : 'High Contrast'}</p>
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="w-full h-14 flex items-center gap-4 px-6 rounded-2xl text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 transition-all group"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold">Terminate Session</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-80 min-h-screen relative z-10 px-3 sm:px-4 md:px-6 pt-20 lg:pt-8 pb-32 lg:pb-20 lg:pr-8">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between mb-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/40 dark:border-white/10 shadow-sm transition-all">
          <div className="flex items-center gap-3">
            <div className="w-1 bg-indigo-600 h-8 rounded-full"></div>
            <div>
              <h1 className="text-3xl font-black tracking-tight dark:text-white uppercase leading-none">{activeLabel}</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Remote Access Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-white/10 hover:text-indigo-600 transition-colors">
              <Bell size={20} />
            </button>
            <Link href="/profile" aria-label="My profile" className="flex items-center gap-3 pl-2 pr-5 py-2 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 group cursor-pointer hover:border-indigo-100 transition-all">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                {user?.name?.charAt(0) || "A"}
              </div>
              <div className="hidden xl:block">
                <p className="text-xs font-black dark:text-white leading-none mb-1">{user?.name || "Admin User"}</p>
                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">{user?.role === 'admin' ? "Level 4 Access" : "Admin"}</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content with AnimatePresence for smooth transitions */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "linear" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

