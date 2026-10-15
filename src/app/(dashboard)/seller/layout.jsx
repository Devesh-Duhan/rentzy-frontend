"use client";

import Image from "next/image";
import BrandLogo from "@/components/BrandLogo";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { logout, reset } from "@/store/slices/authSlice";
import { useEffect } from "react";
import {
  LayoutDashboard,
  User,
  Building2,
  BarChart3,
  MessageSquare,
  CalendarCheck,
  Star,
  TrendingUp,
  PlusCircle,
  Home,
  LogOut,
  Bell,
  Download,
  Upload,
  Wallet,
  Menu,
  X
} from "lucide-react";

const SELLER_MENU = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/seller" },
  { id: "profile", label: "My Profile", icon: User, href: "/seller/profile" },
  { id: "properties", label: "My Properties", icon: Building2, href: "/seller/properties" },
  { id: "reviews", label: "Reviews", icon: Star, href: "/seller/reviews" },
  { id: "bulk-upload", label: "Bulk Upload", icon: Upload, href: "/seller/bulk-upload" },
];

export default function SellerLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user || !['seller', 'admin'].includes(user.role)) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(reset());
    router.push("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="mb-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold border-4 border-slate-800 shadow-xl overflow-hidden relative">
          {user?.profileImage && user?.profileImage !== 'default-profile.png' ? (
            <Image src={user.profileImage} alt={user.name} width={80} height={80} className="w-full h-full object-cover" unoptimized />
          ) : (
            <span>{user?.name?.charAt(0) || "S"}</span>
          )}
        </div>
        <h2 className="text-xl font-bold truncate px-2">{user?.name || "Seller Panel"}</h2>
        <p className="text-slate-400 text-[10px] mt-1 uppercase tracking-widest font-black">Verified Seller</p>
      </div>

      <nav className="flex-1 space-y-1.5">
        {SELLER_MENU.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition duration-200 text-sm ${
              pathname === item.href
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 font-bold"
                : "text-slate-400 hover:bg-white/5 hover:text-white font-semibold"
            }`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </Link>
        ))}
        <Link href="/add" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition font-semibold text-sm">
          <PlusCircle size={18} />
          <span>Add Property</span>
        </Link>
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800 space-y-1.5">
        <Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white transition text-sm font-semibold">
          <Home size={18} />
          <span>Back to Home</span>
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition text-sm font-semibold">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className="hidden lg:flex w-64 bg-slate-900 text-white flex-col p-6 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      <aside className={`lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-slate-900 text-white z-[120] p-6 shadow-2xl transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-end mb-4">
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <SidebarContent />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="sticky top-0 z-[100] glass-effect border-b border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center max-w-7xl mx-auto px-4 py-3 lg:px-8 lg:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden w-10 h-10 shrink-0 flex items-center justify-center app-card text-slate-600 dark:text-slate-300 active:scale-90 transition-transform"
              >
                <Menu size={20} />
              </button>
              <h1 className="min-w-0 text-lg lg:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 truncate">
                <BrandLogo size={36} className="h-9 w-9 rounded-xl" />
                <span className="truncate">{SELLER_MENU.find(i => i.href === pathname)?.label || "Dashboard"}</span>
              </h1>
            </div>

            <div className="flex shrink-0 items-center gap-2 lg:gap-3">
              <Link href="/seller/notifications" className="relative w-10 h-10 flex items-center justify-center app-card text-slate-400 hover:text-indigo-600 transition overflow-hidden">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </Link>
              <span className="hidden sm:inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest">Active</span>
              <button onClick={handleLogout} className="lg:hidden w-10 h-10 flex items-center justify-center app-card text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition active:scale-90" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
