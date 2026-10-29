"use client";

import filterUiStyles from "@/components/filters/Filters.module.css";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Building2, MapPin, Eye, Edit2, Trash2, Search, AlertTriangle, X, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { getSellerProperties } from "@/store/slices/propertySlice";
import axios from "@/lib/axios";
import toast from "react-hot-toast";
import ContentSkeleton from "@/components/ContentSkeleton";

export default function SellerProperties() {
  const dispatch = useDispatch();
  const { sellerProperties, isLoading, isError } = useSelector((state) => state.property);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasRequested, setHasRequested] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingProperty, setDeletingProperty] = useState(null);

  useEffect(() => {
    setHasRequested(true);
    dispatch(getSellerProperties());
  }, [dispatch]);

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        setIsDeleting(true);
        await axios.delete(`/properties/${deleteId}`);
        dispatch(getSellerProperties());
        toast.success("Property deleted successfully");
        setDeleteId(null);
        setDeletingProperty(null);
      } catch (error) {
        console.error("Failed to delete property", error);
        toast.error("Failed to delete property");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const initDelete = (prop) => {
    setDeletingProperty(prop);
    setDeleteId(prop._id);
  };

  const filteredProperties = sellerProperties?.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.location.city.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const gridClassName = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 2xl:grid-cols-5";

  return (
    <div className="space-y-6 animate-fade-in relative pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="section-title">My Listings</h2>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search my properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={"input-field !pl-10" + " " + filterUiStyles.filterControl}
            />
          </div>
          <Link href="/add" className="btn-primary flex items-center gap-2 text-sm px-5 py-3">
            <Plus size={16} /> Add
          </Link>
        </div>
      </div>

      {(!hasRequested || isLoading) && sellerProperties.length === 0 ? (
        <ContentSkeleton label="Loading your properties" count={6} className={gridClassName} itemClassName="h-80" />
      ) : isError && sellerProperties.length === 0 ? (
        <div role="alert" className="app-card p-6 text-sm text-red-600">
          Properties could not be loaded. <button type="button" onClick={() => dispatch(getSellerProperties())} className="ml-2 underline">Try again</button>
        </div>
      ) : <div className={gridClassName}>
        <AnimatePresence mode="popLayout">
          {filteredProperties.map((prop) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              key={prop._id}
              className="app-card overflow-hidden group hover:shadow-lg transition-all flex min-w-0 flex-col"
            >
              <div className="aspect-[1.05] relative shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Image src={prop.images?.[0]} width={400} height={380} sizes="(min-width: 1536px) 240px, (min-width: 1280px) 25vw, (min-width: 640px) 33vw, 50vw" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={prop.title} unoptimized />
                <div className="absolute top-2 left-2 right-2 flex flex-col items-start gap-1">
                  <span className={`max-w-full px-2 py-1 rounded-full text-[9px] font-bold uppercase leading-tight shadow-sm ${
                    prop.status === "available" ? "bg-emerald-100 text-emerald-700" : prop.status === "rented" ? "bg-amber-100 text-amber-700" : "bg-white text-slate-700"
                  }`}>
                    {prop.isVerified ? prop.status : prop.rejectionReason ? "Rejected" : "Pending verification"}
                  </span>
                  <span className="max-w-full px-2 py-1 rounded-full text-[9px] font-bold uppercase leading-tight bg-indigo-600 text-white shadow-sm w-fit">
                    {Array.isArray(prop.purpose) ? prop.purpose.join(' & ') : (prop.purpose || 'rent')}
                  </span>
                </div>
              </div>
              <div className="p-3 flex-1 flex min-w-0 flex-col">
                <div className="flex min-w-0 items-center gap-1 text-indigo-600 text-[10px] font-semibold mb-1.5">
                  <MapPin size={12} className="shrink-0" /> <span className="truncate">{prop.location.city}, {prop.location.state}</span>
                </div>
                <h3 className="min-h-9 text-[13px] leading-[18px] sm:text-sm font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 break-words">{prop.title}</h3>
                {prop.rejectionReason && !prop.isVerified && <p className="mb-3 text-xs text-rose-600">{prop.rejectionReason}</p>}
                <div className="flex flex-wrap items-start justify-between gap-2 py-2 border-y border-slate-100 dark:border-slate-700/50 mb-3">
                  <div>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase">Monthly Rent</p>
                    <div className="flex flex-wrap items-center gap-1">
                      <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">₹{prop.price.toLocaleString()}</p>
                      {(prop.pricePerSqft || (prop.areaSqFt ? Math.round(prop.price / prop.areaSqFt) : null)) && (
                        <span className="text-[10px] font-medium text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                          ₹{prop.pricePerSqft || Math.round(prop.price / prop.areaSqFt)}/sqft
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 font-semibold uppercase">Views</p>
                    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1 justify-end">
                      <Eye size={16} className="text-indigo-600" /> {prop.views || 0}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-auto">
                  <Link href={`/add?edit=${prop._id}`} className="flex-1 min-w-0 btn-secondary flex items-center justify-center gap-1 text-[11px] !px-1 !py-2">
                    <Edit2 size={14} /> Edit
                  </Link>
                  <button onClick={() => initDelete(prop)} className="flex-1 min-w-0 py-2 px-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-xl font-bold text-[11px] hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-1 active:scale-95">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredProperties.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-16 app-card border-dashed">
            <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-white">No properties found</h3>
            <p className="section-subtitle text-sm mt-2 max-w-sm mx-auto">{searchTerm ? "No properties match your search term." : "You haven't listed any properties yet. Start adding your first property to reach thousands of potential tenants."}</p>
            {!searchTerm && (
              <Link href="/add" className="btn-primary inline-flex items-center gap-2 mt-6">
                <Plus size={16} /> List First Property
              </Link>
            )}
          </div>
        )}
      </div>}

      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => !isDeleting && setDeleteId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md app-card overflow-hidden shadow-2xl"
            >
              <div className="h-1.5 bg-rose-600 w-full" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-xl flex items-center justify-center">
                    <AlertTriangle size={24} />
                  </div>
                  <button onClick={() => !isDeleting && setDeleteId(null)} disabled={isDeleting} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors disabled:opacity-0">
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-2 mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Delete Listing?</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">This action is permanent and will remove all associated data and media from the marketplace.</p>
                </div>
                {deletingProperty && (
                  <div className="flex items-center gap-3 p-3 mb-6 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={deletingProperty.images[0]} width={56} height={56} className="w-full h-full object-cover" alt="" unoptimized />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-0.5">Deleting now</span>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{deletingProperty.title}</h4>
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => setDeleteId(null)} disabled={isDeleting} className="flex-1 btn-secondary text-sm py-3.5">
                    Keep Property
                  </button>
                  <button onClick={confirmDelete} disabled={isDeleting} className="flex-[1.5] py-3.5 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-rose-200 dark:shadow-none">
                    {isDeleting ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <><Trash2 size={16} /> Confirm Delete</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
