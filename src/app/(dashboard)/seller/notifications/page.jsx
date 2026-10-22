"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Info,
  Trash2,
  Check,
  Star,
  Settings,
  Loader2,
} from "lucide-react";
import axios from "@/lib/axios";
import toast from "react-hot-toast";

// Map the backend Notification.type onto the visual treatment used by this page
const TYPE_STYLES = {
  booking: { icon: CheckCircle2, color: "text-emerald-600", bgColor: "bg-emerald-50", type: "success" },
  message: { icon: MessageSquare, color: "text-blue-600", bgColor: "bg-blue-50", type: "message" },
  payment: { icon: Star, color: "text-amber-600", bgColor: "bg-amber-50", type: "success" },
  property: { icon: CheckCircle2, color: "text-emerald-600", bgColor: "bg-emerald-50", type: "success" },
  system: { icon: Info, color: "text-indigo-600", bgColor: "bg-indigo-50", type: "system" },
  alert: { icon: AlertCircle, color: "text-rose-600", bgColor: "bg-rose-50", type: "alert" },
};

const relativeTime = (iso) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString();
};

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await axios.get("/notifications");
      return res.data?.notifications || res.data || [];
    },
  });

  const notifications = (data || []).map((n) => {
    const style = TYPE_STYLES[n.type] || TYPE_STYLES.system;
    return {
      ...n,
      id: n._id,
      read: n.isRead,
      time: relativeTime(n.createdAt),
      ...style,
    };
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.read;
    if (activeTab === "alerts") return n.type === "alert" || n.type === "system";
    return true;
  });

  const markAllMutation = useMutation({
    mutationFn: async () => {
      await axios.put("/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
    onError: () => toast.error("Failed to mark all as read"),
  });

  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      await axios.put(`/notifications/${id}/read`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    onError: () => toast.error("Failed to mark notification as read"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification removed");
    },
    onError: () => toast.error("Failed to remove notification"),
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="app-card p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-xl flex items-center justify-center relative">
              <Bell size={24} />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h1>
              <p className="section-subtitle text-sm mt-0.5">Manage your alerts and user inquiries</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => markAllMutation.mutate()}
              disabled={unreadCount === 0 || markAllMutation.isPending}
              className="btn-secondary flex items-center justify-center gap-2 text-sm py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {markAllMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Mark all read
            </button>
            <Link href="/notifications/preferences" className="p-2.5 btn-secondary inline-flex" title="Notification preferences">
              <Settings size={18} />
            </Link>
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 app-card w-fit">
        {[
          { id: "all", label: "All Activity" },
          { id: "unread", label: "Unread", count: unreadCount },
          { id: "alerts", label: "Important Alerts" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all relative flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:hover:bg-white/5"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-700"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="app-card p-12 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={28} />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length === 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="app-card p-12 flex flex-col items-center justify-center text-center border-dashed">
                <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300 mb-4">
                  <Bell size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">You&apos;re all caught up!</h3>
                <p className="section-subtitle text-sm max-w-sm">There are no new notifications to show in this specific category right now.</p>
              </motion.div>
            ) : (
              filteredNotifications.map((notif) => {
                const Icon = notif.icon;
                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                    className={`group flex items-start gap-4 p-5 app-card transition-all hover:shadow-md relative overflow-hidden ${
                      !notif.read ? "border-l-4 border-l-indigo-600" : ""
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.bgColor} ${notif.color}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h4 className={`text-sm font-bold ${!notif.read ? "text-slate-900" : "text-slate-700"}`}>{notif.title}</h4>
                      <p className="text-slate-500 text-sm mt-0.5 leading-relaxed pr-8">{notif.message}</p>
                      <span className="text-xs font-medium text-slate-400 mt-1.5 block">{notif.time}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-start mt-1">
                      {!notif.read && (
                        <button onClick={() => markReadMutation.mutate(notif.id)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors" title="Mark as read">
                          <Check size={16} />
                        </button>
                      )}
                      <button onClick={() => deleteMutation.mutate(notif.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
