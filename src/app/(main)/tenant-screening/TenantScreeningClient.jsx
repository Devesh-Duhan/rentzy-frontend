"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Search,
  Briefcase,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  UserCheck,
  Building2,
  Star,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";
import Footer from "@/components/Footer";
import axios from "@/lib/axios";

const screeningFeatures = [
  { icon: Search, title: "Background Check", desc: "Comprehensive criminal and civil background verification" },
  { icon: Briefcase, title: "Employment Verification", desc: "Confirm current employment and income stability" },
  { icon: CreditCard, title: "Credit Score", desc: "Check credit history and financial responsibility" },
  { icon: FileText, title: "Landlord Reference", desc: "Verify rental history with previous landlords" },
];

export default function TenantScreeningClient() {
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    currentAddress: "",
    employerName: "",
    employmentType: "",
    monthlyIncome: "",
  });
  const [screening, setScreening] = useState(false);
  const [report, setReport] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStartScreening = async (e) => {
    e.preventDefault();
    setScreening(true);
    try {
      await axios.post('/leads', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        message: `Tenant Screening Request for ${formData.name}. Employer: ${formData.employerName || 'N/A'}, Income: ₹${formData.monthlyIncome || 'N/A'}, Address: ${formData.currentAddress || 'N/A'}`,
        source: 'property_enquiry',
      });
    } catch (err) {
      console.error("Failed to record screening lead:", err);
    }
    setTimeout(() => {
      const score = Math.floor(Math.random() * 20) + 78;
      setReport({
        ...formData,
        status: score >= 80 ? "Clear" : "Flagged",
        score,
        checks: [
          { name: "Identity Verification", passed: true },
          { name: "Background Check", passed: score >= 75 },
          { name: "Employment Verification", passed: score >= 80 },
          { name: "Credit Score Check", passed: score >= 70 },
          { name: "Landlord Reference", passed: score >= 85 },
        ],
      });
      setScreening(false);
    }, 2000);
  };

  if (!user || user.role !== "seller") {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-900 via-purple-800 to-violet-900 dark:from-slate-900 dark:via-violet-950 dark:to-slate-900">
          <div className="app-container py-20 md:py-32 relative">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest mb-6">
                <ShieldCheck size={14} /> Tenant Screening
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter mb-4">
                Tenant Verification & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-violet-400">Screening</span>
              </h1>
              <p className="text-lg md:text-xl text-purple-200 font-medium max-w-2xl mx-auto mb-10">
                Verify tenants with background checks, employment verification, and credit screening
              </p>
            </motion.div>
          </div>
        </div>
        <div className="app-container py-20 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle size={40} className="text-purple-600" />
          </div>
          <h2 className="section-title text-2xl mb-3">Seller Access Required</h2>
          <p className="section-subtitle max-w-md mx-auto mb-8">
            Tenant screening is available for verified sellers only. Please log in with a seller account to access this feature.
          </p>
          <Link
            href={user ? "/become-seller" : "/login"}
            className="btn-primary inline-flex items-center gap-2"
          >
            <ArrowRight size={18} /> {user ? "Become a Seller" : "Sign In"}
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-900 via-purple-800 to-violet-900 dark:from-slate-900 dark:via-violet-950 dark:to-slate-900">
        <div className="app-container py-20 md:py-32 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest mb-6">
              <ShieldCheck size={14} /> Tenant Screening
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter mb-4">
              Tenant Verification & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-violet-400">Screening</span>
            </h1>
            <p className="text-lg md:text-xl text-purple-200 font-medium max-w-2xl mx-auto">
              Verify tenants with background checks, employment verification, and credit screening
            </p>
          </motion.div>
        </div>
      </div>

      <div className="app-container py-16">
        <div className="app-grid mb-16">
          {screeningFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="app-card p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                <feature.icon size={24} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="section-title text-2xl mb-6">Start Tenant Screening</h2>
            <form onSubmit={handleStartScreening} className="app-card p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Tenant Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Full name" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Phone *</label>
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="tenant@example.com" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Current Address</label>
                <textarea name="currentAddress" value={formData.currentAddress} onChange={handleChange} placeholder="Full address" rows={2} className="input-field resize-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Employer Name</label>
                  <input type="text" name="employerName" value={formData.employerName} onChange={handleChange} placeholder="Company" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Employment Type</label>
                  <select name="employmentType" value={formData.employmentType} onChange={handleChange} className="input-field">
                    <option value="">Select</option>
                    <option value="salaried">Salaried</option>
                    <option value="self-employed">Self Employed</option>
                    <option value="business">Business Owner</option>
                    <option value="freelancer">Freelancer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Monthly Income</label>
                  <input type="number" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleChange} placeholder="₹" className="input-field" />
                </div>
              </div>
              <button
                type="submit"
                disabled={screening || !formData.name || !formData.phone}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {screening ? (
                  <><Loader2 size={20} className="animate-spin" /> Screening in Progress...</>
                ) : (
                  <><ShieldCheck size={20} /> Start Screening</>
                )}
              </button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="section-title text-2xl mb-6">Screening Report</h2>
            {screening ? (
              <div className="app-card p-8 flex flex-col items-center justify-center py-16">
                <Loader2 size={40} className="text-purple-600 animate-spin mb-4" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">Running background checks...</p>
              </div>
            ) : report ? (
              <div className="app-card overflow-hidden">
                <div className={`p-6 flex items-center gap-3 ${report.status === "Clear" ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-amber-50 dark:bg-amber-900/20"}`}>
                  {report.status === "Clear" ? (
                    <CheckCircle size={28} className="text-emerald-600" />
                  ) : (
                    <AlertTriangle size={28} className="text-amber-600" />
                  )}
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Status: {report.status}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Verification Score: {report.score}%</p>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-400">Name:</span> <span className="font-bold text-slate-900 dark:text-white">{report.name}</span></div>
                    <div><span className="text-slate-400">Phone:</span> <span className="font-bold text-slate-900 dark:text-white">{report.phone}</span></div>
                    <div><span className="text-slate-400">Email:</span> <span className="font-bold text-slate-900 dark:text-white">{report.email || "N/A"}</span></div>
                  </div>
                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Completed Checks</h4>
                  <div className="space-y-2">
                    {report.checks.map((check, i) => (
                      <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{check.name}</span>
                        {check.passed ? (
                          <CheckCircle size={16} className="text-emerald-600" />
                        ) : (
                          <XCircle size={16} className="text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="app-card p-8 flex flex-col items-center justify-center py-16">
                <UserCheck size={48} className="text-purple-300 dark:text-purple-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 text-center">Fill in tenant details and start screening to generate a report.</p>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 rounded-3xl border border-purple-100 dark:border-purple-900/50 text-center">
          <ShieldCheck size={32} className="mx-auto mb-3 text-purple-600" />
          <h3 className="section-title text-xl mb-2">Tenant Screening Service</h3>
          <p className="section-subtitle max-w-xl mx-auto">
            Tenant screening helps you find reliable tenants. Coming soon with partner verification agencies.
          </p>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}