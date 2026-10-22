"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Flag, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "@/lib/axios";

const reasons = ["Wrong Info", "Spam", "Duplicate", "Fraud", "Other"];

const ReportProperty = ({ propertyId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef(null);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;
    const dialog = dialogRef.current, body = document.body, root = document.documentElement;
    const previousFocus = document.activeElement;
    const { scrollX, scrollY } = window;
    const bodyStyles = Object.fromEntries(['position', 'top', 'left', 'width', 'overflowX', 'overflowY'].map(key => [key, body.style[key]]));
    const rootStyles = { overflowX: root.style.overflowX, overflowY: root.style.overflowY };
    dialog.showModal();
    Object.assign(body.style, { position: 'fixed', top: -scrollY + 'px', left: -scrollX + 'px', width: '100%', overflow: 'hidden' });
    root.style.overflow = 'hidden';
    return () => {
      if (dialog.open) dialog.close();
      Object.assign(body.style, bodyStyles);
      Object.assign(root.style, rootStyles);
      previousFocus?.focus({ preventScroll: true });
      window.scrollTo({ left: scrollX, top: scrollY, behavior: 'instant' });
    };
  }, [isOpen]);

  const openModal = () => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let userName = "";
    let userEmail = "";
    let userPhone = "";
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        userName = user.name || "";
        userEmail = user.email || "";
        userPhone = user.phone || "";
      } catch {}
    }
    setName(userName);
    setEmail(userEmail);
    setPhone(userPhone);
    setReason("");
    setDescription("");
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }
    // The ContactLead schema requires name, email, phone and message.
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post("/leads", {
        source: "property_enquiry",
        message: `REPORT: ${reason}${description ? ` - ${description}` : ""}${propertyId ? ` (Property ID: ${propertyId})` : ""}`,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        property: propertyId || undefined,
      });
      toast.success("Report submitted successfully");
      setIsOpen(false);
    } catch {
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition-all font-semibold text-sm active:scale-95"
      >
        <Flag className="w-4 h-4" /> Report
      </button>

      {isOpen && createPortal(
          <dialog ref={dialogRef} aria-labelledby="report-property-title"
            onCancel={event => { event.preventDefault(); setIsOpen(false); }}
            onClick={event => { if (event.target === event.currentTarget) setIsOpen(false); }}
            className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-md max-h-[calc(100dvh_-_2rem)] overflow-visible border-0 bg-transparent p-0 text-inherit backdrop:bg-black/50 backdrop:backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="flex max-h-[calc(100dvh_-_2rem)] min-h-0 flex-col overflow-hidden bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700"
            >
              <div className="shrink-0 flex items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-700 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                    <Flag className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h3 id="report-property-title" className="text-lg font-bold text-gray-900 dark:text-white">Report Property</h3>
                </div>
                <button
                  type="button"
                  aria-label="Close report form"
                  onClick={() => setIsOpen(false)}
                  className="shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                <div data-report-dialog-body className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-4">
                <div>
                  <label htmlFor="report-reason" className="block text-sm font-semibold text-gray-600 dark:text-slate-300 mb-1.5">
                    Reason <span className="text-rose-500">*</span>
                  </label>
                  <select id="report-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                  >
                    <option value="">Select a reason</option>
                    {reasons.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="report-description" className="block text-sm font-semibold text-gray-600 dark:text-slate-300 mb-1.5">Description</label>
                  <textarea id="report-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Provide additional details..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="report-name" className="block text-sm font-semibold text-gray-600 dark:text-slate-300 mb-1.5">
                      Name <span className="text-rose-500">*</span>
                    </label>
                    <input id="report-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="report-phone" className="block text-sm font-semibold text-gray-600 dark:text-slate-300 mb-1.5">
                      Phone <span className="text-rose-500">*</span>
                    </label>
                    <input id="report-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Your phone"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="report-email" className="block text-sm font-semibold text-gray-600 dark:text-slate-300 mb-1.5">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input id="report-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                  />
                </div>

                </div>
                <div className="shrink-0 border-t border-gray-100 dark:border-slate-700 p-5 sm:p-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-rose-200 dark:shadow-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Flag className="w-4 h-4" /> Submit Report
                    </>
                  )}
                </button>
                </div>
              </form>
            </motion.div>
          </dialog>, document.body
      )}
    </>
  );
};

export default ReportProperty;
