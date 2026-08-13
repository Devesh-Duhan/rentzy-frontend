"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";

const INITAL_NOTIFICATIONS = [
  {
    id: 1,
    type: "success",
    title: "Property Approved",
    message: "Your property 'Luxury Villa in Beverly Hills' has been approved and is now live.",
    time: "2 mins ago",
    read: false,
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    id: 2,
    type: "message",
    title: "New Inquiry Received",
    message: "John Doe is interested in your 'Downtown Apartment' listing.",
    time: "1 hour ago",
    read: false,
    icon: MessageSquare,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: 3,
    type: "alert",
    title: "Subscription Expiring",
    message: "Your premium seller subscription will expire in 3 days. Renew now to avoid losing visibility.",
    time: "5 hours ago",
    read: true,
    icon: AlertCircle,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
  },
  {
    id: 4,
    type: "system",
    title: "Platform Update",
    message: "We have updated our terms of service and added new features to the property editor.",
    time: "1 day ago",
    read: true,
    icon: Info,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    id: 5,
    type: "success",
    title: "Review Added",
    message: "A new 5-star review was added to your 'Sunset Penthouse' property.",
    time: "2 days ago",
    read: true,
    icon: Star,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  }
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(INITAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState("all");

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "unread") return !n.read;
    if (activeTab === "alerts") return n.type === "alert";
    return true;
  });

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="app-card p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-xl flex items-center justify-center relative">
              <Bell size={24} />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {unreadCount}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h1>
              <p className="section-subtitle text-sm mt-0.5">Manage your alerts and user inquiries</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button onClick={markAllAsRead} disabled={unreadCount === 0} className="btn-secondary flex items-center justify-center gap-2 text-sm py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
              <Check size={16} /> Mark all read
            </button>
            <button className="p-2.5 btn-secondary">
              <Settings size={18} />
            </button>
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
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="app-card p-12 flex flex-col items-center justify-center text-center border-dashed">
              <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <Bell size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">You're all caught up!</h3>
              <p className="section-subtitle text-sm max-w-sm">There are no new notifications to show in this specific category right now.</p>
            </motion.div>
          ) : (
            filteredNotifications.map((notif) => (
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
                  <notif.icon size={20} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className={`text-sm font-bold ${!notif.read ? "text-slate-900" : "text-slate-700"}`}>{notif.title}</h4>
                      <p className="text-slate-500 text-sm mt-0.5 leading-relaxed pr-8">{notif.message}</p>
                      <span className="text-xs font-medium text-slate-400 mt-1.5 block">{notif.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-start mt-1">
                  {!notif.read && (
                    <button onClick={() => markAsRead(notif.id)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors" title="Mark as read">
                      <Check size={16} />
                    </button>
                  )}
                  <button onClick={() => deleteNotification(notif.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationsPage;
