"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import BrandLogo from "@/components/BrandLogo";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeProvider";
import { logout } from "@/store/slices/authSlice";
import axiosInstance from "@/lib/axios";
import {
  Search, X, ChevronDown, Home, PlusCircle, Building2,
  UserCircle, Heart, MapPin, Bell, Menu, LogOut,
  Settings, Moon, Sun, MessageCircle, LayoutGrid,
} from "lucide-react";

const BOTTOM_NAV_ITEMS = [
  { id: "home", icon: Home, label: "Home", href: "/" },
  { id: "search", icon: Search, label: "Explore", href: "/properties" },
  { id: "add", icon: PlusCircle, label: "Add", href: "/add", auth: true },
  { id: "wishlist", icon: Heart, label: "Saved", href: "/wishlist" },
  { id: "profile", icon: UserCircle, label: "Profile", href: "/profile" },
];

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const sidebarRef = useRef(null);

  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { theme, toggleTheme } = useTheme();
  const isDashboard = pathname?.startsWith("/admin") || pathname?.startsWith("/seller") || pathname?.startsWith("/owners");
  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register") || pathname?.startsWith("/verify-otp") || pathname?.startsWith("/forgot-password") || pathname?.startsWith("/reset-password");
  const { data: notifications = [] } = useQuery({
    queryKey: ['navbar-notifications', user?._id],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/notifications');
      return Array.isArray(data.notifications) ? data.notifications : Array.isArray(data) ? data : [];
    },
    enabled: Boolean(user?._id) && !isDashboard && !isAuthPage,
    staleTime: 30000,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setShowNotifPanel(false);
    setShowUserMenu(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const body = document.body;
    const root = document.documentElement;
    const { scrollX, scrollY } = window;
    const bodyStyles = Object.fromEntries(
      ["position", "top", "left", "width", "overflowX", "overflowY"].map(key => [key, body.style[key]])
    );
    const rootStyles = { overflowX: root.style.overflowX, overflowY: root.style.overflowY };
    // Fix the page in place so mobile touch scrolling stays inside the sidebar.
    Object.assign(body.style, {
      position: "fixed", top: -scrollY + "px", left: -scrollX + "px", width: "100%", overflow: "hidden",
    });
    root.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = event => { if (event.matches) setMobileMenuOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      Object.assign(body.style, bodyStyles);
      Object.assign(root.style, rootStyles);
      window.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifPanel(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (isDashboard || isAuthPage) return null;

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await dispatch(logout());
    router.push("/");
  };

  const isActive = (href) => pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <>
      {/* Desktop Header */}
      <header className={`header-nav transition-all duration-300 ${scrolled ? "shadow-sm" : ""}`}>
        <div className="app-container h-full flex items-center justify-between gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <BrandLogo size={36} priority className="h-9 w-9 rounded-xl shadow-lg" />
            <span className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
              Rentzy<span className="text-indigo-600">Pro</span>
            </span>
          </Link>

          {/* Center Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { label: "Buy", href: "/buy" },
              { label: "Rent", href: "/rent" },
              { label: "Sell", href: "/sell" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === item.href
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Desktop Quick Nav Icons (moved from bottom nav) */}
            <div className="hidden md:flex items-center gap-0.5 mr-1 min-w-[120px] justify-end">
              {BOTTOM_NAV_ITEMS.map((item) => {
                if (item.auth && (!mounted || !user)) return null;
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`relative p-2.5 rounded-xl transition-all ${
                      active
                        ? "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                    }`}
                    aria-label={item.label}
                  >
                    <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                    {item.id === "wishlist" && user && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 text-white text-[7px] font-bold rounded-full flex items-center justify-center">0</span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Separator */}
            <div className="hidden md:block w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* Theme Toggle */}
            {mounted && (
              <button onClick={toggleTheme} className="btn-ghost p-2.5" aria-label="Toggle theme">
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

            {/* Notifications */}
            <div className="static sm:relative" ref={notifRef}>
              <button onClick={() => setShowNotifPanel(!showNotifPanel)} className="btn-ghost p-2.5 relative" aria-label="Notifications" aria-expanded={showNotifPanel} aria-controls="navbar-notifications">
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {notifications.length > 9 ? "9+" : notifications.length}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotifPanel && (
                  <motion.div
                    id="navbar-notifications"
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className="absolute inset-x-4 top-full mt-2 flex max-h-[calc(100dvh-var(--header-height)-var(--bottom-nav-height)-1rem)] flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 sm:inset-x-auto sm:right-0 sm:w-80 md:max-h-[calc(100dvh-var(--header-height)-1rem)]"
                  >
                    <div className="shrink-0 p-4 border-b border-slate-100 dark:border-slate-700">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</h4>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="min-h-0 overflow-y-auto p-8 text-center text-sm text-slate-400">No new notifications</div>
                    ) : (
                      <div className="min-h-0 max-h-64 overflow-y-auto overscroll-contain break-words">
                        {notifications.slice(0, 5).map((n, i) => (
                          <div key={i} className="p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <Link href="/notifications/preferences" className="block shrink-0 p-3 text-center text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                      Notification Settings
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="btn-ghost p-1" aria-label="User menu">
                {user?.profileImage && user.profileImage !== "default-profile.png" ? (
                  <Image src={user.profileImage} alt="" width={32} height={32} className="rounded-lg object-cover w-8 h-8" unoptimized />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0) || "?"}
                  </div>
                )}
              </button>
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                  >
                    {user ? (
                      <>
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                          <p className="font-semibold text-sm text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                        </div>
                        <div className="p-2">
                          {user.role === "admin" && (
                            <Link href="/admin" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm font-medium text-slate-700 dark:text-slate-300" onClick={() => setShowUserMenu(false)}>
                              <Settings size={16} /> Admin Dashboard
                            </Link>
                          )}
                          {user.role === "seller" && (
                            <Link href="/seller" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm font-medium text-slate-700 dark:text-slate-300" onClick={() => setShowUserMenu(false)}>
                              <Building2 size={16} /> Seller Dashboard
                            </Link>
                          )}
                          <Link href="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm font-medium text-slate-700 dark:text-slate-300" onClick={() => setShowUserMenu(false)}>
                            <UserCircle size={16} /> My Profile
                          </Link>
                          <Link href="/wishlist" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm font-medium text-slate-700 dark:text-slate-300" onClick={() => setShowUserMenu(false)}>
                            <Heart size={16} /> Saved Properties
                          </Link>
                          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-sm font-medium text-rose-600 mt-1">
                            <LogOut size={16} /> Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 space-y-2">
                        <Link href="/login" className="block w-full text-center btn-primary text-sm" onClick={() => setShowUserMenu(false)}>Sign In</Link>
                        <Link href="/register" className="block w-full text-center btn-secondary text-sm" onClick={() => setShowUserMenu(false)}>Create Account</Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden btn-ghost p-2.5" aria-label="Menu" aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation">
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] h-dvh overflow-hidden lg:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              id="mobile-navigation"
              ref={sidebarRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]"
            >
              {/* Sidebar Header */}
              <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <BrandLogo size={32} className="h-8 w-8 rounded-lg shadow-lg" />
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    Menu
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* User Info */}
              {user && (
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    {user.profileImage && user.profileImage !== "default-profile.png" ? (
                      <Image src={user.profileImage} alt="" width={40} height={40} className="rounded-xl object-cover w-10 h-10" unoptimized />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {user.name?.charAt(0) || "?"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions (bottom nav items) */}
              <div className="px-3 pt-4 pb-2">
                <p className="px-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Quick Actions</p>
                <div className="grid grid-cols-4 gap-2 min-h-[58px]">
                  {mounted && BOTTOM_NAV_ITEMS.map((item) => {
                    if (item.auth && !user) return null;
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                          active
                            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                            : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
                        <span className="text-[10px] font-semibold">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Links */}
              <div className="px-3 pt-4 pb-2">
                <p className="px-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Browse</p>
                <div className="space-y-0.5">
                  {[
                    { label: "Buy", href: "/buy", icon: Building2 },
                    { label: "Rent", href: "/rent", icon: Building2 },
                    { label: "Sell", href: "/sell", icon: PlusCircle },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                          pathname === item.href
                            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                            : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Icon size={16} strokeWidth={1.5} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* More Links */}
              <div className="px-3 pt-4 pb-2">
                <p className="px-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">More</p>
                <div className="space-y-0.5">
                  {[
                    { label: "Blog", href: "/blog" },
                    { label: "Help", href: "/help" },
                    { label: "Contact", href: "/contact" },
                    { label: "About", href: "/about" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                        pathname === item.href
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                          : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Auth Actions */}
              <div className="px-5 py-5 mt-2 border-t border-slate-100 dark:border-slate-800">
                {user ? (
                  <button onClick={handleLogout} className="flex items-center justify-center gap-3 w-full py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
                    <LogOut size={16} /> Sign Out
                  </button>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <Link href="/login" className="w-full text-center btn-primary text-sm" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                    <Link href="/register" className="w-full text-center btn-secondary text-sm" onClick={() => setMobileMenuOpen(false)}>Create Account</Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav md:hidden flex items-center px-2 safe-bottom">
        {BOTTOM_NAV_ITEMS.map((item) => {
          if (item.auth && (!mounted || !user)) return null;
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`bottom-nav-item ${active ? "active" : ""}`}
            >
              <div className={`relative p-1.5 rounded-xl transition-all duration-200 ${active ? "bg-indigo-50 dark:bg-indigo-500/10" : ""}`}>
                <Icon size={active ? 22 : 20} strokeWidth={active ? 2.5 : 1.5} />
                {item.id === "wishlist" && user && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[7px] font-bold rounded-full flex items-center justify-center">0</span>
                )}
              </div>
              <span className={`text-[9px] font-semibold ${active ? "text-indigo-600 dark:text-indigo-400" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
