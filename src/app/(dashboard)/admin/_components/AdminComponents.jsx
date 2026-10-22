"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, X, Plus, Search, AlertCircle, ChevronRight } from "lucide-react";

export const Toast = ({ toast }) => (
  <AnimatePresence>
    {toast.show && (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border bg-white border-slate-100 min-w-[320px]"
      >
        <div className={`p-2 rounded-xl ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
        </div>
        <p className="text-sm font-bold text-slate-800">{toast.message}</p>
      </motion.div>
    )}
  </AnimatePresence>
);

export const NewListingModal = ({ isOpen, onClose, form, preview, onFormChange, onImageChange, onSubmit, isEditMode }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[80]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed inset-x-0 bottom-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2 w-full md:max-w-2xl bg-white z-[90] rounded-t-[40px] md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-slate-100 max-h-[95vh] md:max-h-[85vh]"
        >
          <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900">{isEditMode ? "Edit Property" : "Add New Property"}</h3>
              <p className="text-xs md:text-sm text-slate-500 font-medium">{isEditMode ? "Update the property details." : "Create a premium listing for your users."}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 md:p-3 bg-white text-slate-400 rounded-2xl hover:text-rose-500 transition-colors shadow-sm"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Property Title</label>
                <input
                  name="title"
                  value={form.title}
                  placeholder="e.g. Modern 3BHK Villa"
                  onChange={onFormChange}
                  type="text"
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Property Type</label>
                <select name="type" value={form.type} onChange={onFormChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all appearance-none">
                  <option>Apartment</option>
                  <option>Villa</option>
                  <option>Flat</option>
                  <option>Shop</option>
                  <option>Land</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detailed Location</label>
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="location"
                  value={form.location}
                  placeholder="Search area or address..."
                  onChange={onFormChange}
                  type="text"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly Rent</label>
                <input
                  name="rent"
                  value={form.rent}
                  placeholder="₹ Amount"
                  onChange={onFormChange}
                  type="text"
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">+91</span>
                  <input
                    name="contact"
                    value={form.contact}
                    placeholder="1234567890"
                    onChange={onFormChange}
                    type="tel"
                    className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Property Images</label>
              <input
                type="file"
                id="propertyImage"
                className="hidden"
                accept="image/*"
                onChange={onImageChange}
              />
              <label
                htmlFor="propertyImage"
                className="border-2 border-dashed border-slate-200 rounded-[32px] p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-slate-50 transition-all group block overflow-hidden relative min-h-[200px]"
              >
                {preview ? (
                  <div className="absolute inset-0">
                    <Image src={preview} className="w-full h-full object-cover" alt="Preview" width={400} height={400} unoptimized />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Plus size={32} className="text-white" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                      <Plus size={32} />
                    </div>
                    <p className="text-sm font-bold text-slate-600">Click to upload property image</p>
                    <p className="text-xs text-slate-400 mt-1 font-medium italic">Supports JPG, PNG up to 10MB</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="p-6 md:p-8 border-t border-slate-50 flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 md:py-4 bg-slate-100 text-slate-600 rounded-[20px] font-black text-sm hover:bg-slate-200 transition-all"
            >
              Discard
            </button>
            <button
              onClick={onSubmit}
              className="flex-1 py-3 md:py-4 bg-indigo-600 text-white rounded-[20px] font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              {isEditMode ? "Save Changes" : "Submit Property"}
            </button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export { default as InviteUserModal } from "./InviteUserModal";
export { default as CategoryModal } from "./CategoryModal";
export { default as LocationModal } from "./LocationModal";
export { default as BlogModal } from "./BlogModal";

export const UserEditModal = ({ isOpen, onClose, form, onFormChange, onSubmit, isEditMode }) => {
  const dialogRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted || !isOpen || !dialogRef.current) return;
    const element = dialogRef.current, body = document.body, root = document.documentElement;
    const previousFocus = document.activeElement;
    const { scrollX, scrollY } = window;
    const bodyStyles = Object.fromEntries(['position', 'top', 'left', 'width', 'overflowX', 'overflowY'].map(key => [key, body.style[key]]));
    const rootStyles = { overflowX: root.style.overflowX, overflowY: root.style.overflowY };
    // The native top layer is positioned against the viewport, outside animated ancestors.
    element.showModal();
    Object.assign(body.style, { position: 'fixed', top: -scrollY + 'px', left: -scrollX + 'px', width: '100%', overflow: 'hidden' });
    root.style.overflow = 'hidden';
    return () => {
      if (element.open) element.close();
      Object.assign(body.style, bodyStyles);
      Object.assign(root.style, rootStyles);
      previousFocus?.focus({ preventScroll: true });
      window.scrollTo({ left: scrollX, top: scrollY, behavior: 'instant' });
    };
  }, [isOpen, mounted]);
  if (!mounted) return null;
  return createPortal(
    <dialog ref={dialogRef} aria-labelledby="user-profile-dialog-title" onCancel={onClose}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}
      className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-lg max-h-[calc(100dvh_-_2rem)] overflow-visible border-0 bg-transparent p-0 text-inherit backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm">
      {isOpen && <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="flex max-h-[calc(100dvh_-_2rem)] min-h-0 flex-col overflow-hidden rounded-[24px] sm:rounded-[32px] border border-slate-100 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900">
          <div className="shrink-0 p-5 sm:p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
            <div>
              <h3 id="user-profile-dialog-title" className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{isEditMode ? "Edit User Profile" : "User Profile"}</h3>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">Manage user permissions and profile details.</p>
            </div>
            <button type="button" aria-label="Close user profile" onClick={onClose} className="shrink-0 p-2.5 md:p-3 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-rose-500 transition-colors shadow-sm">
              <X size={20} />
            </button>
          </div>

          <div data-user-profile-body className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300">Full Name</label>
              <input
                name="name"
                value={form.name}
                placeholder="John Doe"
                onChange={onFormChange}
                type="text"
                className="w-full p-3.5 md:p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300">Email Address</label>
              <input
                name="email"
                value={form.email}
                placeholder="john@example.com"
                onChange={onFormChange}
                type="email"
                className="w-full p-3.5 md:p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300">Role</label>
                <select 
                  name="role" 
                  value={form.role} 
                  onChange={onFormChange} 
                  className="w-full p-3.5 md:p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all appearance-none cursor-pointer"
                >
                  <option value="admin">Admin</option>
                  <option value="seller">Seller</option>
                  <option value="buyer">Buyer</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300">Status</label>
                <select name="status" value={form.status} onChange={onFormChange} className="w-full p-3.5 md:p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all appearance-none cursor-pointer">
                  <option>Active</option>
                  <option>Warning</option>
                  <option>Banned</option>
                </select>
              </div>
            </div>
          </div>

          <div className="shrink-0 p-5 sm:p-6 border-t border-slate-100 dark:border-white/5 flex gap-3 md:gap-4">
            <button onClick={onClose} className="flex-1 py-3.5 md:py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[20px] font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Cancel</button>
            <button onClick={onSubmit} className="flex-1 py-3.5 md:py-4 bg-indigo-600 text-white rounded-[20px] font-black text-sm shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all">
              Save Changes
            </button>
          </div>

      </motion.div>}
    </dialog>,
    document.body
  );
};

export const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName, type = "Property" }) => {
  const dialogRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted || !isOpen || !dialogRef.current) return;
    const element = dialogRef.current, body = document.body, root = document.documentElement;
    const previousFocus = document.activeElement;
    const { scrollX, scrollY } = window;
    const bodyStyles = Object.fromEntries(['position', 'top', 'left', 'width', 'overflowX', 'overflowY'].map(key => [key, body.style[key]]));
    const rootStyles = { overflowX: root.style.overflowX, overflowY: root.style.overflowY };
    // The native top layer is positioned against the viewport, outside animated ancestors.
    element.showModal();
    Object.assign(body.style, { position: 'fixed', top: -scrollY + 'px', left: -scrollX + 'px', width: '100%', overflow: 'hidden' });
    root.style.overflow = 'hidden';
    return () => {
      if (element.open) element.close();
      Object.assign(body.style, bodyStyles);
      Object.assign(root.style, rootStyles);
      previousFocus?.focus({ preventScroll: true });
      window.scrollTo({ left: scrollX, top: scrollY, behavior: 'instant' });
    };
  }, [isOpen, mounted]);
  if (!mounted) return null;
  return createPortal(
    <dialog ref={dialogRef} role="alertdialog" aria-labelledby="delete-confirmation-title" aria-describedby="delete-confirmation-description"
      onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}
      className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-md max-h-[calc(100dvh_-_2rem)] overflow-visible border-0 bg-transparent p-0 text-inherit backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm">
      {isOpen && <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="flex max-h-[calc(100dvh_-_2rem)] min-h-0 flex-col overflow-hidden rounded-[24px] sm:rounded-[32px] border border-slate-100 bg-white text-center shadow-2xl dark:border-white/10 dark:bg-slate-900">
        <div data-delete-dialog-body className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 sm:p-8">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h3 id="delete-confirmation-title" className="text-xl font-black text-slate-900 dark:text-white mb-2">Delete {type}?</h3>
          <p id="delete-confirmation-description" className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Are you sure you want to delete <span className="text-slate-900 dark:text-white font-bold break-words [overflow-wrap:anywhere]">&quot;{itemName}&quot;</span>? This action cannot be undone.
          </p>
        </div>
          <div className="flex shrink-0 gap-3 px-6 pb-6 sm:px-8 sm:pb-8">
            <button type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button type="button"
              onClick={onConfirm}
              className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all"
            >
              Delete
            </button>
          </div>
      </motion.div>}
    </dialog>,
    document.body
  );
};
