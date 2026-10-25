"use client";

import filterUiStyles from "@/components/filters/Filters.module.css";
import { useState, useEffect } from "react";
import {
  Download,
  Users,
  Building2,
  Target,
  Calendar,
  RefreshCcw,
  Clock,
  FileText,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "@/lib/axios";
import { toast } from "react-hot-toast";

const STORAGE_KEY = "admin-export-dates";

function getLastExport(key) {
  if (typeof window === "undefined") return null;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return stored[key] || null;
  } catch {
    return null;
  }
}

function setLastExport(key) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    stored[key] = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {}
}

const EXPORT_TYPES = [
  {
    key: "users",
    label: "Export Users",
    description: "Download a CSV of all registered users including their name, email, role, status, and registration date.",
    endpoint: "/admin/export/users",
    icon: Users,
    color: "indigo",
  },
  {
    key: "properties",
    label: "Export Properties",
    description: "Download a CSV of all property listings with details like title, type, location, price, status, and owner info.",
    endpoint: "/admin/export/properties",
    icon: Building2,
    color: "emerald",
  },
  {
    key: "leads",
    label: "Export Leads",
    description: "Download a CSV of all leads and inquiries with contact information, source, status, and follow-up details.",
    endpoint: "/admin/export/leads",
    icon: Target,
    color: "amber",
  },
];

export default function ExportsCenter() {
  const [lastExports, setLastExports] = useState({});
  const [exporting, setExporting] = useState(null);
  const [dateFilters, setDateFilters] = useState({});

  useEffect(() => {
    setLastExports({
      users: getLastExport("users"),
      properties: getLastExport("properties"),
      leads: getLastExport("leads"),
    });
  }, []);

  const handleExport = async (type) => {
    const { endpoint, label } = EXPORT_TYPES.find((t) => t.key === type);
    const dateFilter = dateFilters[type];

    setExporting(type);
    const loadingToast = toast.loading(`Exporting ${label}...`);

    try {
      const params = {};
      if (dateFilter?.from) params.from = dateFilter.from;
      if (dateFilter?.to) params.to = dateFilter.to;

      const response = await axios.get(endpoint, {
        params,
        responseType: "blob",
      });

      const disposition = response.headers?.["content-disposition"];
      const filename = disposition
        ? disposition.split("filename=")[1]?.replace(/"/g, "") || `${type}-export.csv`
        : `${type}-export-${new Date().toISOString().split("T")[0]}.csv`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setLastExport(type);
      setLastExports((prev) => ({ ...prev, [type]: new Date().toISOString() }));
      toast.success(`${label} downloaded successfully.`, { id: loadingToast });
    } catch {
      toast.error(`Failed to export ${label}.`, { id: loadingToast });
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Export Center</h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold mt-2">
          Download platform data as CSV files for external analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {EXPORT_TYPES.map((type, i) => {
          const lastDate = lastExports[type.key];
          const isExporting = exporting === type.key;

          return (
            <motion.div
              key={type.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-800/40 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col"
            >
              <div className="p-8 flex flex-col flex-1">
                <div className={`w-16 h-16 rounded-[20px] bg-${type.color}-50 dark:bg-${type.color}-500/10 flex items-center justify-center text-${type.color}-600 mb-6`}>
                  <type.icon size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{type.label}</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 flex-1">
                  {type.description}
                </p>

                <div className="space-y-4 mb-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date Range (Optional)</p>
                  <div className={"flex items-center gap-3" + " " + filterUiStyles.toolbar}>
                    <div className="flex-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">From</label>
                      <input
                        type="date"
                        value={dateFilters[type.key]?.from || ""}
                        onChange={(e) =>
                          setDateFilters((prev) => ({
                            ...prev,
                            [type.key]: { ...prev[type.key], from: e.target.value },
                          }))
                        }
                        className={"w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-white outline-none focus:border-indigo-500 transition-all" + " " + filterUiStyles.filterControl}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">To</label>
                      <input
                        type="date"
                        value={dateFilters[type.key]?.to || ""}
                        onChange={(e) =>
                          setDateFilters((prev) => ({
                            ...prev,
                            [type.key]: { ...prev[type.key], to: e.target.value },
                          }))
                        }
                        className={"w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-white outline-none focus:border-indigo-500 transition-all" + " " + filterUiStyles.filterControl}
                      />
                    </div>
                  </div>
                </div>

                {lastDate && (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-4">
                    <Clock size={14} />
                    Last export: {new Date(lastDate).toLocaleDateString("en-GB", {
                      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                )}

                <button
                  onClick={() => handleExport(type.key)}
                  disabled={isExporting}
                  className={`w-full py-4 rounded-[20px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                    isExporting
                      ? "bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed"
                      : `bg-${type.color}-600 text-white shadow-xl hover:bg-${type.color}-700 shadow-${type.color}-100`
                  }`}
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download size={18} /> Download CSV
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-800/40 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1">About Data Exports</h4>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              Exports are generated as CSV files compatible with Excel, Google Sheets, and other data analysis tools.
              Use the optional date range filter to narrow down records by creation date.
              Large exports may take a few moments to generate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
