"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Download, FileText, AlertCircle, CheckCircle, XCircle, Loader2, Table } from "lucide-react";
import axios from "@/lib/axios";
import toast from "react-hot-toast";

function generateSampleCSV() {
  const headers = ["title","description","price","deposit","city","state","type","purpose","bedrooms","bathrooms","areaSqFt","amenities","phone","address"];
  const sample = `"Luxury 2BHK Apartment","Beautiful apartment in prime location",25000,50000,Mumbai,Maharashtra,apartment,rent,2,1,1200,"Parking,Security,Gym",9876543210,"Bandra West"`;
  return [headers.join(","), sample].join("\n");
}

function downloadSampleCSV() {
  const csv = generateSampleCSV();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sample-bulk-upload.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function BulkUploadPage() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragOver(true);
    if (e.type === "dragleave") setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === "text/csv") {
      setFile(dropped);
      setResults(null);
    } else {
      toast.error("Please upload a CSV file");
    }
  }, []);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setResults(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file first");
      return;
    }
    setUploading(true);
    setResults(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("/bulk/properties", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(res.data.results);
      toast.success(res.data.message);
    } catch (err) {
      const msg = err.response?.data?.message || "Upload failed";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setResults(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Bulk Upload</h2>
        <FileText className="text-indigo-600" size={22} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="app-card p-6">
            <h3 className="font-bold mb-1">Upload CSV File</h3>
            <p className="section-subtitle text-sm mb-4">Upload a CSV file with your property listings. The file must include title, price, type, and purpose columns.</p>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                  : file
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                  : "border-slate-200 dark:border-white/10 hover:border-indigo-400 bg-slate-50 dark:bg-white/5"
              }`}
            >
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <FileText size={40} className="text-emerald-500" />
                  <div>
                    <p className="font-bold">{file.name}</p>
                    <p className="text-sm text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); resetUpload(); }} className="text-sm text-red-500 hover:text-red-600 font-bold">Remove</button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload size={40} className="text-slate-300 dark:text-slate-600" />
                  <div>
                    <p className="font-bold">Drop your CSV here or click to browse</p>
                    <p className="text-sm text-slate-400 font-medium">Supports .csv files only</p>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2 text-sm py-3.5 shadow-lg disabled:opacity-50"
            >
              {uploading ? (
                <><Loader2 className="animate-spin" size={18} /> Uploading...</>
              ) : (
                <><Upload size={18} /> Upload & Import</>
              )}
            </button>
          </motion.div>

          {results && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="app-card p-6">
              <h3 className="font-bold mb-4">Upload Results</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4 text-center">
                  <CheckCircle size={24} className="text-emerald-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-emerald-600">{results.success}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Created</p>
                </div>
                <div className="bg-red-50 dark:bg-red-500/10 rounded-xl p-4 text-center">
                  <XCircle size={24} className="text-red-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-red-600">{results.failed}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Failed</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
                  <Table size={24} className="text-slate-500 mx-auto mb-1" />
                  <p className="text-xl font-bold">{results.success + results.failed}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total</p>
                </div>
              </div>
              {results.errors.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-red-500"><AlertCircle size={14} /> Error Details</h4>
                  <div className="bg-red-50 dark:bg-red-500/5 rounded-xl overflow-hidden border border-red-100 dark:border-red-500/10">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-red-200 dark:border-red-500/10">
                          <th className="text-left px-4 py-3 font-bold">Row</th>
                          <th className="text-left px-4 py-3 font-bold">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.errors.map((e, i) => (
                          <tr key={i} className="border-b border-red-100 dark:border-red-500/5">
                            <td className="px-4 py-2.5 font-semibold">{e.row}</td>
                            <td className="px-4 py-2.5 text-red-600">{e.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="app-card p-6">
            <h3 className="font-bold mb-2">Sample Template</h3>
            <p className="section-subtitle text-sm mb-4">Download a sample CSV template to see the expected format and required columns.</p>
            <button onClick={downloadSampleCSV} className="btn-secondary w-full flex items-center justify-center gap-2 text-sm py-3">
              <Download size={16} /> Download Template
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="app-card p-6">
            <h3 className="font-bold mb-3">Required Columns</h3>
            <ul className="space-y-2 text-sm">
              {["title", "price", "type", "purpose"].map((col) => (
                <li key={col} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="font-semibold">{col}</span>
                  <span className="text-red-500 text-[10px]">*required</span>
                </li>
              ))}
            </ul>
            <h4 className="font-bold text-sm mt-4 mb-2">Optional Columns</h4>
            <ul className="space-y-1.5 text-sm text-slate-400">
              {["description", "deposit", "city", "state", "bedrooms", "bathrooms", "areaSqFt", "amenities", "phone", "address", "images"].map((col) => (
                <li key={col} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span>{col}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
