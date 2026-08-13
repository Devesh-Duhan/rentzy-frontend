"use client";

import { useState, useEffect } from "react";
import { Toast } from "../_components/AdminComponents";
import { fetchSettings, saveSettings } from "./_data/settingsApi";

export default function SettingsPage() {
  const [siteSettings, setSiteSettings] = useState({
    title: '',
    email: '',
    phone: '',
    socials: { instagram: '', twitter: '' },
    listingFee: 200,
  });
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings()
      .then((data) => {
        setSiteSettings({
          title: data.title || '',
          email: data.email || '',
          phone: data.phone || '',
          listingFee: data.listingFee || 200,
          socials: {
            instagram: data.socials?.instagram || '',
            twitter: data.socials?.twitter || '',
          },
        });
      })
      .catch(() => setToast({ show: true, message: "Failed to load settings", type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleSiteSettingsChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSiteSettings(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setSiteSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      await saveSettings(siteSettings);
      showNotification("Settings saved!");
    } catch (err) {
      showNotification("Failed to save settings", "error");
    }
  };

  return (
    loading ? (
      <div className="p-8">Loading...</div>
    ) : (
      <div className="space-y-8 animate-fade-in max-w-5xl bg-white dark:bg-slate-900 rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Platform Settings</h2>
          <button onClick={handleSave} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 transition-all">
            Save Changes
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 dark:text-slate-100">Identity</h4>
            <p className="text-sm text-slate-400 dark:text-slate-300 font-medium">Manage platform branding, support email, and contact information.</p>
          </div>
          <div className="lg:col-span-2 bg-white dark:bg-slate-800/60 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 space-y-6 shadow-sm">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-300 tracking-widest pl-1">Site Title</label>
              <input name="title" value={siteSettings.title} onChange={handleSiteSettingsChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-300 tracking-widest pl-1">Support Email</label>
              <input name="email" value={siteSettings.email} onChange={handleSiteSettingsChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-300 tracking-widest pl-1">Contact Phone</label>
              <input name="phone" value={siteSettings.phone} onChange={handleSiteSettingsChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-indigo-400 tracking-widest pl-1">Property Listing Fee (INR)</label>
              <input name="listingFee" type="number" value={siteSettings.listingFee} onChange={handleSiteSettingsChange} className="w-full p-4 bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 rounded-2xl text-sm font-black text-indigo-600 dark:text-indigo-400 outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 dark:text-slate-100">Socials</h4>
            <p className="text-sm text-slate-400 dark:text-slate-300 font-medium">Connect with your community via social media profiles.</p>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-300 tracking-widest pl-1">Instagram</label>
              <input name="socials.instagram" value={siteSettings.socials.instagram} onChange={handleSiteSettingsChange} className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-300 tracking-widest pl-1">Twitter (X)</label>
              <input name="socials.twitter" value={siteSettings.socials.twitter} onChange={handleSiteSettingsChange} className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all" />
            </div>
          </div>
        </div>

        <Toast toast={toast} />
      </div>
    )
  );
}
