"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus, Edit2, Trash2, MapPin, X, Search
} from "lucide-react";
import axios from "@/lib/axios";
import { Toast, DeleteConfirmationModal } from "../_components/AdminComponents";

const TYPE_TABS = ["All", "city", "area", "locality"];

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ id: null, name: "" });
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [form, setForm] = useState({
    name: "", type: "area", parent: "", state: "", pincode: "", latitude: "", longitude: "", active: true
  });

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get("/admin/locations");
      setLocations(data.locations || data);
    } catch {
      showNotification("Failed to load locations", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchLocations(); }, []);

  const openAddModal = () => {
    setForm({ name: "", type: "area", parent: "", state: "", pincode: "", latitude: "", longitude: "", active: true });
    setIsEditMode(false);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (loc) => {
    setForm({
      name: loc.name || "",
      type: loc.type || "area",
      parent: loc.parent?._id || loc.parent || "",
      state: loc.state || "",
      pincode: loc.pincode || "",
      latitude: loc.latitude?.toString() || "",
      longitude: loc.longitude?.toString() || "",
      active: loc.active ?? true
    });
    setIsEditMode(true);
    setEditingId(loc._id);
    setIsModalOpen(true);
  };

  const handleDelete = (loc) => {
    setDeleteConfig({ id: loc._id, name: loc.name });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/admin/locations/${deleteConfig.id}`);
      showNotification("Location deleted!", "info");
      fetchLocations();
    } catch {
      showNotification("Delete failed!", "error");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        pincode: form.pincode || undefined
      };
      if (isEditMode) {
        await axios.put(`/admin/locations/${editingId}`, payload);
        showNotification("Location updated!");
      } else {
        await axios.post("/admin/locations", payload);
        showNotification("Location created!");
      }
      setIsModalOpen(false);
      fetchLocations();
    } catch {
      showNotification(isEditMode ? "Update failed!" : "Create failed!", "error");
    }
  };

  const filtered = locations.filter(loc => {
    const matchesSearch = loc.name?.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "All" || loc.type === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Locations</h2>
          <p className="text-sm text-slate-500 font-medium">Manage cities, areas & localities</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search locations..."
              className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-100 transition-all w-full sm:w-64"
            />
          </div>
          <button onClick={openAddModal} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg text-sm">
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {TYPE_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab ? "bg-indigo-600 text-white shadow-lg" : "bg-white dark:bg-slate-800/40 text-slate-400 border border-slate-100 dark:border-white/5 hover:border-indigo-200"}`}
          >
            {tab === "All" ? "All Types" : tab}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800/40 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-400 mt-4">Loading locations...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <MapPin size={40} className="text-slate-300 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-400">No locations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">State</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Pincode</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Properties</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="text-right p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((loc) => (
                  <motion.tr
                    key={loc._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 font-bold text-slate-900 dark:text-white text-sm">{loc.name}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${loc.type === "city" ? "bg-purple-50 text-purple-600 dark:bg-purple-500/10" : loc.type === "area" ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10" : "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10"}`}>
                        {loc.type}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500">{loc.state || "—"}</td>
                    <td className="p-4 text-sm text-slate-500">{loc.pincode || "—"}</td>
                    <td className="p-4 text-sm font-bold text-slate-700 dark:text-slate-300">{loc.propertyCount ?? 0}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${loc.active ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : "bg-slate-100 text-slate-400 dark:bg-white/5"}`}>
                        {loc.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(loc)} className="p-2 bg-slate-50 dark:bg-white/5 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(loc)} className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all">
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

      {/* Modal */}
      {isModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[80]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 bottom-8 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2 w-[calc(100%-32px)] md:max-w-lg bg-white dark:bg-slate-900 z-[90] rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-slate-100 dark:border-white/10 max-h-[95vh]"
          >
            <div className="p-6 md:p-8 border-b border-slate-50 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{isEditMode ? "Edit Location" : "Add Location"}</h3>
                <p className="text-xs text-slate-500 font-medium">{isEditMode ? "Update location details." : "Add a new location."}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-rose-500 transition-colors shadow-sm">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-6 md:p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mumbai" className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-100 transition-all appearance-none">
                    <option value="city">City</option>
                    <option value="area">Area</option>
                    <option value="locality">Locality</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Parent</label>
                <select value={form.parent} onChange={e => setForm({ ...form, parent: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-100 transition-all appearance-none">
                  <option value="">None</option>
                  {locations.filter(l => l._id !== editingId).map(loc => (
                    <option key={loc._id} value={loc._id}>{loc.name} ({loc.type})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">State</label>
                  <input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="Maharashtra" className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pincode</label>
                  <input value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} placeholder="400001" className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Latitude</label>
                  <input value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} placeholder="19.0760" type="number" step="any" className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Longitude</label>
                  <input value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} placeholder="72.8777" type="number" step="any" className="w-full p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active</label>
                <button onClick={() => setForm({ ...form, active: !form.active })} className={`w-12 h-6 rounded-full transition-colors ${form.active ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${form.active ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
            <div className="p-6 md:p-8 border-t border-slate-50 dark:border-white/5 flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-[20px] font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Discard</button>
              <button onClick={handleSubmit} className="flex-1 py-4 bg-indigo-600 text-white rounded-[20px] font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                {isEditMode ? "Save Changes" : "Create Location"}
              </button>
            </div>
          </motion.div>
        </>
      )}

      <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} itemName={deleteConfig.name} type="Location" />
      <Toast toast={toast} />
    </div>
  );
}
