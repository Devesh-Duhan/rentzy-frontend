"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit2, Trash2, MapPin, Search, RefreshCcw, Building, Navigation, Globe2, CheckCircle2
} from "lucide-react";
import axios from "@/lib/axios";
import { DeleteConfirmationModal, LocationModal } from "../_components/AdminComponents";
import toast from "react-hot-toast";

const TYPE_TABS = ["All", "city", "area", "locality"];

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [search, setSearch] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ id: null, name: "" });

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get("/admin/locations");
      setLocations(Array.isArray(data) ? data : data.locations || data.data || []);
    } catch {
      toast.error("Failed to load territory locations.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const openAddModal = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const openEditModal = (loc) => {
    setEditingLocation(loc);
    setIsModalOpen(true);
  };

  const handleDelete = (loc) => {
    setDeleteConfig({ id: loc._id, name: loc.name });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    const loadingToast = toast.loading("Removing territory record...");
    try {
      await axios.delete(`/admin/locations/${deleteConfig.id}`);
      toast.success("Location deleted successfully!", { id: loadingToast });
      fetchLocations();
    } catch {
      toast.error("Failed to delete location.", { id: loadingToast });
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleLocationSubmit = async (payload) => {
    if (editingLocation) {
      await axios.put(`/admin/locations/${editingLocation._id}`, payload);
      toast.success("Location updated successfully!");
    } else {
      await axios.post("/admin/locations", payload);
      toast.success("Location registered successfully!");
    }
    fetchLocations();
  };

  const filtered = locations.filter((loc) => {
    const matchesSearch =
      loc.name?.toLowerCase().includes(search.toLowerCase()) ||
      loc.state?.toLowerCase().includes(search.toLowerCase()) ||
      loc.pincode?.includes(search);
    const matchesTab = activeTab === "All" || loc.type === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Territory Locations
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold mt-1">
            Manage cities, suburban areas & neighborhood sectors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLocations}
            className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm transition-all active:scale-95"
            title="Refresh locations"
          >
            <RefreshCcw size={18} />
          </button>
          <button
            onClick={openAddModal}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-200 dark:shadow-none transition-all"
          >
            <Plus size={18} /> Add Location
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-6 bg-white dark:bg-slate-900/50 rounded-[28px] border border-slate-100 dark:border-white/10 shadow-sm backdrop-blur-3xl">
        {/* Type Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                  : "bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
              }`}
            >
              {tab === "All" ? "All Territories" : tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full md:max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by city, area, state, or pincode..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl md:rounded-2xl text-sm font-bold text-slate-700 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>
      </div>

      {/* Locations Table Container */}
      <div className="bg-white dark:bg-slate-800/40 rounded-[32px] md:rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
              Loading Territory Records...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center max-w-sm mx-auto">
            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-4">
              <MapPin size={36} />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              No locations found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              {search ? "No locations match your filtered parameters." : "Register your first city or area territory."}
            </p>
            {!search && (
              <button
                onClick={openAddModal}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
              >
                Create Location
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <th className="text-left px-8 py-5">Territory Name</th>
                  <th className="text-left px-6 py-5">Classification</th>
                  <th className="text-left px-6 py-5">Parent / State</th>
                  <th className="text-left px-6 py-5">Pincode</th>
                  <th className="text-left px-6 py-5">Coordinates</th>
                  <th className="text-left px-6 py-5">Status</th>
                  <th className="text-right px-8 py-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {filtered.map((loc, idx) => (
                  <motion.tr
                    key={loc._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-slate-50/80 dark:hover:bg-white/2 transition-colors group"
                  >
                    {/* Territory Name */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm shrink-0">
                          {loc.type === "city" ? (
                            <Building size={20} />
                          ) : loc.type === "area" ? (
                            <MapPin size={20} />
                          ) : (
                            <Navigation size={20} />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">
                            {loc.name}
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {loc.propertyCount !== undefined ? `${loc.propertyCount} properties` : "0 properties"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Classification */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                          loc.type === "city"
                            ? "bg-purple-50 text-purple-600 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20"
                            : loc.type === "area"
                            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20"
                            : "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20"
                        }`}
                      >
                        {loc.type}
                      </span>
                    </td>

                    {/* Parent / State */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {loc.state || "—"}
                        </span>
                        {loc.parent && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            Part of {typeof loc.parent === "object" ? loc.parent.name : "Parent"}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Pincode */}
                    <td className="px-6 py-5">
                      <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                        {loc.pincode || "—"}
                      </span>
                    </td>

                    {/* Coordinates */}
                    <td className="px-6 py-5">
                      {loc.coordinates?.lat && loc.coordinates?.lng ? (
                        <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                          {loc.coordinates.lat.toFixed(2)}, {loc.coordinates.lng.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                          (loc.isActive ?? loc.active)
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20"
                            : "bg-slate-100 text-slate-400 dark:bg-white/5 border border-slate-200/60 dark:border-white/5"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${(loc.isActive ?? loc.active) ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                        {(loc.isActive ?? loc.active) ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(loc)}
                          className="w-9 h-9 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl border border-slate-200/60 dark:border-white/5 transition-all active:scale-90 shadow-sm"
                          title="Edit Location"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(loc)}
                          className="w-9 h-9 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl border border-slate-200/60 dark:border-white/5 transition-all active:scale-90 shadow-sm"
                          title="Delete Location"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Location Modal (Add / Edit) */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        locations={locations}
        editingLocation={editingLocation}
        onSubmit={handleLocationSubmit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={deleteConfig.name}
        type="Location"
      />
    </div>
  );
}

