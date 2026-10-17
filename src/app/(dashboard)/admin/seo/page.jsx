"use client";
import ContentSkeleton from "@/components/ContentSkeleton";


import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Globe, Image, Code, Eye, Save, Loader2 } from "lucide-react";
import axios from "@/lib/axios";
import toast from "react-hot-toast";

export default function SEOPage() {
  const [form, setForm] = useState({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogImage: "",
    twitterHandle: "",
    googleAnalyticsId: "",
    googleSiteVerification: "",
    headerScripts: "",
    footerScripts: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [loadError, setLoadError] = useState(false);
  const loadSettings = useCallback(() => {
    setLoading(true);
    setLoadError(false);
    axios.get("/settings/admin")
      .then((res) => {
        const d = res.data;
        setForm({
          metaTitle: d.metaTitle || "",
          metaDescription: d.metaDescription || "",
          metaKeywords: d.metaKeywords || "",
          ogImage: d.ogImage || "",
          twitterHandle: d.twitterHandle || "",
          googleAnalyticsId: d.googleAnalyticsId || "",
          googleSiteVerification: d.googleSiteVerification || "",
          headerScripts: d.headerScripts || "",
          footerScripts: d.footerScripts || "",
        });
      })
      .catch(() => { setLoadError(true); toast.error("Failed to load SEO settings"); })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (loading || loadError || saving) return;
    setSaving(true);
    try {
      await axios.put("/settings", form);
      toast.success("SEO settings saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };


  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">SEO Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Manage search engine optimization and analytics</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading || loadError || saving}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {loading ? <ContentSkeleton label="Loading SEO settings" count={3} itemClassName="h-28" /> : loadError ? <div role="alert">Could not load settings. <button onClick={loadSettings} className="btn-secondary">Try again</button></div> : <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 mt-1">
            <Globe size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100">Meta Tags</h4>
            <p className="text-xs text-slate-400 font-medium">Homepage meta title, description & keywords</p>
          </div>
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/60 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-5 shadow-sm">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-300 tracking-widest">Meta Title</label>
            <input name="metaTitle" value={form.metaTitle} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all" placeholder="RentzyPro - Find Your Dream Property" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-300 tracking-widest">Meta Description</label>
            <textarea name="metaDescription" value={form.metaDescription} onChange={handleChange} rows={3} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all resize-none" placeholder="Discover premium properties for rent and sale..." />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-300 tracking-widest">Meta Keywords</label>
            <input name="metaKeywords" value={form.metaKeywords} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all" placeholder="real estate, property, rent, buy, apartment" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-1">
            <Image size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100">Social & OG</h4>
            <p className="text-xs text-slate-400 font-medium">Open Graph image and Twitter handle</p>
          </div>
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/60 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-5 shadow-sm">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-300 tracking-widest">OG Image URL</label>
            <input name="ogImage" value={form.ogImage} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all" placeholder="https://example.com/og-image.jpg" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-300 tracking-widest">Twitter Handle</label>
            <input name="twitterHandle" value={form.twitterHandle} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all" placeholder="@rentzypro" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-1">
            <Eye size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100">Analytics & Verification</h4>
            <p className="text-xs text-slate-400 font-medium">Google Analytics & Search Console</p>
          </div>
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/60 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-5 shadow-sm">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-300 tracking-widest">Google Analytics ID</label>
            <input name="googleAnalyticsId" value={form.googleAnalyticsId} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all" placeholder="G-XXXXXXXXXX" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-300 tracking-widest">Google Site Verification</label>
            <input name="googleSiteVerification" value={form.googleSiteVerification} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all" placeholder="google-site-verification=..." />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 mt-1">
            <Code size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100">Custom Scripts</h4>
            <p className="text-xs text-slate-400 font-medium">Header & footer scripts (analytics, pixels)</p>
          </div>
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/60 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-5 shadow-sm">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-300 tracking-widest">Header Scripts</label>
            <textarea name="headerScripts" value={form.headerScripts} onChange={handleChange} rows={4} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-mono text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all resize-none" placeholder="<!-- Custom header scripts -->" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-300 tracking-widest">Footer Scripts</label>
            <textarea name="footerScripts" value={form.footerScripts} onChange={handleChange} rows={4} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-mono text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all resize-none" placeholder="<!-- Custom footer scripts -->" />
          </div>
        </div>
      </div>
      </>}
    </motion.div>
  );
}
