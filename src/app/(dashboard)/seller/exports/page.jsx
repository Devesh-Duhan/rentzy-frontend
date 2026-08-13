"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Calendar, Building2, Users, BarChart3, Loader2 } from "lucide-react";
import axios from "@/lib/axios";
import toast from "react-hot-toast";

const EXPORT_TYPES = [
  {
    id: "properties",
    label: "Export Properties List",
    desc: "Download your property listings as CSV",
    icon: Building2,
    endpoint: "/properties/seller",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
  },
  {
    id: "leads",
    label: "Export Leads List",
    desc: "Download your leads data as CSV",
    icon: Users,
    endpoint: "/leads",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    id: "performance",
    label: "Export Performance Report",
    desc: "Download performance metrics as CSV",
    icon: BarChart3,
    endpoint: "/properties/seller-stats",
    iconColor: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10",
  },
];

function generateCSV(headers, rows) {
  const headerRow = headers.join(",");
  const dataRows = rows.map((row) =>
    headers
      .map((h) => {
        const val = row[h] !== undefined ? row[h] : "";
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(",")
  );
  return [headerRow, ...dataRows].join("\n");
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SellerExports() {
  const [loading, setLoading] = useState(null);
  const [dateRanges, setDateRanges] = useState({
    properties: { from: "", to: "" },
    leads: { from: "", to: "" },
    performance: { from: "", to: "" },
  });

  const handleExport = async (type) => {
    setLoading(type);
    try {
      const range = dateRanges[type];
      const params = {};
      if (range.from) params.from = range.from;
      if (range.to) params.to = range.to;

      const res = await axios.get(
        EXPORT_TYPES.find((t) => t.id === type).endpoint,
        { params }
      );
      const data = res.data;
      let csv, filename;

      if (type === "properties") {
        const properties = Array.isArray(data?.properties)
          ? data.properties
          : Array.isArray(data)
          ? data
          : [];
        const headers = [
          "title", "price", "type", "purpose", "city", "address",
          "bedrooms", "bathrooms", "areaSqFt", "views", "status", "createdAt",
        ];
        const rows = properties.map((p) => ({
          title: p.title || "",
          price: p.price || "",
          type: Array.isArray(p.type) ? p.type.join("/") : p.type || "",
          purpose: p.purpose || "",
          city: p.location?.city || "",
          address: p.location?.address || "",
          bedrooms: p.bedrooms || "",
          bathrooms: p.bathrooms || "",
          areaSqFt: p.areaSqFt || "",
          views: p.views || 0,
          status: p.status || "",
          createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : "",
        }));
        csv = generateCSV(headers, rows);
        filename = `properties-export-${Date.now()}.csv`;
      } else if (type === "leads") {
        const leads = Array.isArray(data?.leads) ? data.leads : Array.isArray(data) ? data : [];
        const headers = ["name", "email", "phone", "source", "status", "property", "createdAt"];
        const rows = leads.map((l) => ({
          name: l.name || "",
          email: l.email || "",
          phone: l.phone || "",
          source: l.source || "",
          status: l.status || "",
          property: l.property?.title || "",
          createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : "",
        }));
        csv = generateCSV(headers, rows);
        filename = `leads-export-${Date.now()}.csv`;
      } else {
        const stats = data;
        const headers = ["metric", "value"];
        const rows = [
          { metric: "Total Views", value: stats.totalViews || 0 },
          { metric: "Total Inquiries", value: stats.totalInquiries || 0 },
          { metric: "Avg Rating", value: stats.avgRating || 0 },
          { metric: "Total Properties", value: stats.totalProperties || 0 },
        ];
        csv = generateCSV(headers, rows);
        filename = `performance-report-${Date.now()}.csv`;
      }

      downloadCSV(csv, filename);
      toast.success(`${EXPORT_TYPES.find((t) => t.id === type).label} downloaded`);
    } catch (err) {
      toast.error("Export failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Export Reports</h2>
        <FileText className="text-indigo-600" size={22} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {EXPORT_TYPES.map((exp, i) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="app-card p-6 flex flex-col"
          >
            <div className={`w-12 h-12 ${exp.bg} rounded-xl flex items-center justify-center mb-4`}>
              <exp.icon className={exp.iconColor} size={24} />
            </div>
            <h3 className="font-bold mb-1">{exp.label}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">{exp.desc}</p>

            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Date Range (optional)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={dateRanges[exp.id].from}
                    onChange={(e) => setDateRanges((prev) => ({ ...prev, [exp.id]: { ...prev[exp.id], from: e.target.value } }))}
                    className="input-field text-xs pl-9 py-2.5"
                  />
                </div>
                <span className="text-slate-400 self-center text-xs font-medium">to</span>
                <div className="relative flex-1">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={dateRanges[exp.id].to}
                    onChange={(e) => setDateRanges((prev) => ({ ...prev, [exp.id]: { ...prev[exp.id], to: e.target.value } }))}
                    className="input-field text-xs pl-9 py-2.5"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => handleExport(exp.id)}
              disabled={loading === exp.id}
              className="btn-primary w-full mt-auto flex items-center justify-center gap-2 text-sm py-3.5 shadow-lg"
            >
              {loading === exp.id ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Download size={18} />
              )}
              {loading === exp.id ? "Exporting..." : "Download"}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
