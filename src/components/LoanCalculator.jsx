"use client";

import { useState } from "react";
import { Calculator, IndianRupee, Percent, Calendar, RefreshCw } from "lucide-react";

const LoanCalculator = () => {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [result, setResult] = useState(null);

  const calculateEMI = () => {
    const P = parseFloat(amount);
    const r = parseFloat(rate) / 12 / 100;
    const n = parseFloat(tenure) * 12;

    if (!P || !r || !n || P <= 0 || r <= 0 || n <= 0) return;

    const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    setResult({
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
    });
  };

  const handleReset = () => {
    setAmount("");
    setRate("");
    setTenure("");
    setResult(null);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-indigo-500/5 border border-gray-100 dark:border-slate-700 p-6 md:p-8 w-full max-w-md mx-auto transition-colors">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Loan Calculator</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-300 mb-1.5">
            <IndianRupee className="w-4 h-4" /> Loan Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 5000000"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-300 mb-1.5">
            <Percent className="w-4 h-4" /> Interest Rate (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="e.g. 8.5"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-300 mb-1.5">
            <Calendar className="w-4 h-4" /> Loan Tenure (years)
          </label>
          <input
            type="number"
            value={tenure}
            onChange={(e) => setTenure(e.target.value)}
            placeholder="e.g. 20"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={calculateEMI}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <Calculator className="w-4 h-4" /> Calculate
        </button>
        <button
          onClick={handleReset}
          className="p-3 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all active:scale-95"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {result && (
        <div className="mt-6 p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 space-y-3 animate-fade-in">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Monthly EMI</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">₹{result.emi.toLocaleString("en-IN")}</span>
          </div>
          <div className="border-t border-indigo-200/50 dark:border-indigo-700/30 pt-3 flex justify-between">
            <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Total Interest</span>
            <span className="font-bold text-gray-700 dark:text-slate-200">₹{result.totalInterest.toLocaleString("en-IN")}</span>
          </div>
          <div className="border-t border-indigo-200/50 dark:border-indigo-700/30 pt-3 flex justify-between">
            <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Total Payment</span>
            <span className="font-bold text-gray-700 dark:text-slate-200">₹{result.totalPayment.toLocaleString("en-IN")}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanCalculator;
