"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Percent,
  Calculator,
  IndianRupee,
  CheckCircle,
  X,
  Landmark,
  ArrowRight,
  Phone,
  Mail,
  Users,
  Clock,
} from "lucide-react";
import Link from "next/link";
import LoanCalculator from "@/components/LoanCalculator";
import Footer from "@/components/Footer";

const partnerBanks = [
  { name: "State Bank of India", logo: "SBI", rate: "8.50%", processingFee: "0.35%" },
  { name: "HDFC Bank", logo: "HDFC", rate: "8.65%", processingFee: "0.50%" },
  { name: "ICICI Bank", logo: "ICICI", rate: "8.55%", processingFee: "0.45%" },
  { name: "Axis Bank", logo: "AXIS", rate: "8.70%", processingFee: "0.40%" },
  { name: "Kotak Mahindra", logo: "KOTAK", rate: "8.60%", processingFee: "0.50%" },
  { name: "Yes Bank", logo: "YES", rate: "8.75%", processingFee: "0.35%" },
  { name: "Bank of Baroda", logo: "BOB", rate: "8.40%", processingFee: "0.30%" },
  { name: "PNB Housing", logo: "PNB", rate: "8.50%", processingFee: "0.35%" },
];

const steps = [
  { icon: Calculator, title: "Calculate EMI", desc: "Use our EMI calculator to estimate monthly payments" },
  { icon: CheckCircle, title: "Check Eligibility", desc: "Find out your loan eligibility in minutes" },
  { icon: ArrowRight, title: "Apply Online", desc: "Submit your application with minimal documentation" },
];

export default function HomeLoansClient() {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", amount: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleApplySubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setShowApplyModal(false);
      setSubmitted(false);
      setFormData({ name: "", phone: "", email: "", amount: "" });
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-800 to-blue-900 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
        <div className="app-container py-16 md:py-24 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 text-white/80 text-xs font-semibold uppercase tracking-widest mb-4">
              <Landmark size={14} /> Home Loans
            </div>
            <h1 className="section-title text-white text-3xl md:text-5xl lg:text-6xl">
              Home Loan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-400">Services</span>
            </h1>
            <p className="text-blue-200 text-sm md:text-base mt-3 max-w-2xl mx-auto">
              Compare rates from leading banks. Calculate EMI, check eligibility, and apply online.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="app-container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="section-title text-xl md:text-2xl mb-5">Calculate Your EMI</h2>
            <LoanCalculator />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="section-title text-xl md:text-2xl mb-5">How It Works</h2>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={step.title} className="app-card p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <step.icon size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Step {i + 1}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{step.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowApplyModal(true)}
              className="mt-4 w-full btn-primary inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30"
            >
              <ArrowRight size={18} /> Apply Now for Home Loan
            </button>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h2 className="section-title text-xl md:text-2xl mb-6">Partner Banks</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {partnerBanks.map((bank, i) => (
              <motion.div
                key={bank.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="app-card p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                  <span className="text-xs font-bold text-blue-600">{bank.logo}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs mb-1">{bank.name}</h3>
                <p className="text-[11px] text-slate-500">Rate: <span className="font-bold text-emerald-600">{bank.rate}</span></p>
                <p className="text-[11px] text-slate-400">Fee: {bank.processingFee}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h2 className="section-title text-xl md:text-2xl mb-6">Current Interest Rates</h2>
          <div className="app-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50">
                    <th className="text-left px-4 py-3 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px]">Bank</th>
                    <th className="text-left px-4 py-3 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px]">Interest Rate</th>
                    <th className="text-left px-4 py-3 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px]">Processing Fee</th>
                    <th className="text-left px-4 py-3 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px]">Max Tenure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {partnerBanks.map((bank, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{bank.name}</td>
                      <td className="px-4 py-3 text-emerald-600 font-bold">{bank.rate}</td>
                      <td className="px-4 py-3 text-slate-500">{bank.processingFee}</td>
                      <td className="px-4 py-3 text-slate-500">30 Years</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/50 text-center">
          <Building2 size={28} className="mx-auto mb-2 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Home Loan Services</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Home loan services coming soon. We're partnering with leading banks to bring you the best rates.
          </p>
        </motion.div>
      </div>

      <AnimatePresence>
        {showApplyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => { if (!submitted) setShowApplyModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowApplyModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all">
                <X size={16} />
              </button>

              {submitted ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle size={32} className="text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Application Submitted!</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">We'll contact you within 24 hours with loan offers.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Apply for Home Loan</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Our partners will get in touch with the best offers.</p>
                  <form onSubmit={handleApplySubmit} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-field"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input-field"
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-field"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Loan Amount (₹)</label>
                      <input
                        type="number"
                        required
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="input-field"
                        placeholder="5000000"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full btn-primary bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                    >
                      Submit Application
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
