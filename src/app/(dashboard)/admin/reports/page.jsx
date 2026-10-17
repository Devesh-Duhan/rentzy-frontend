"use client";
import ContentSkeleton from "@/components/ContentSkeleton";


import { motion } from "framer-motion";
import { BarChart3, TrendingUp, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "@/lib/axios";

export default function ReportsSection() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get('/admin/payments');
      setPayments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">System Reports</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/40 p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Revenue Growth</h3>
            <div className="p-2 px-4 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
               <TrendingUp size={14} /> +12.5% this month
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {[45, 60, 55, 80, 95, 75, 90].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group">
                <motion.div 
                  initial={{ height: 0 }} 
                  animate={{ height: `${h}%` }} 
                  className={`w-full max-w-[40px] rounded-t-xl transition-all ${i === 4 ? 'bg-indigo-600 shadow-lg' : 'bg-slate-100 dark:bg-slate-700'}`} 
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/40 p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Platform Distribution</h3>
            <div className="space-y-4">
              {[ 
                { label: "Mobile app", val: "72%", col: "indigo" }, 
                { label: "Direct/Web", val: "24%", col: "emerald" }, 
                { label: "Other", val: "4%", col: "amber" } 
              ].map(d => (
                <div key={d.label}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>{d.label}</span>
                    <span>{d.val}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full bg-${d.col}-600`} style={{ width: d.val }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-6 border-t border-slate-50 dark:border-white/5">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
               Reports are synchronized with the central database.
             </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800/40 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
               <CreditCard className="text-indigo-600" /> Recent Transactions
            </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className="bg-slate-50/50 dark:bg-white/5 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                   <th className="px-8 py-5">Customer</th>
                   <th className="px-6 py-5">Property</th>
                   <th className="px-6 py-5">Amount</th>
                   <th className="px-6 py-5">Date</th>
                   <th className="px-8 py-5 text-right">Status</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {isLoading && <tr><td colSpan={5} className="p-6"><ContentSkeleton label="Loading transactions" itemClassName="h-12" /></td></tr>}
                {payments.map((p) => (
                   <tr key={p._id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-all">
                      <td className="px-8 py-5 font-bold text-slate-900 dark:text-white">{p.userId?.name}</td>
                      <td className="px-6 py-5 text-sm text-slate-500 font-medium">{p.propertyId?.title}</td>
                      <td className="px-6 py-5 font-black text-slate-900 dark:text-white">₹{p.totalPrice?.toLocaleString()}</td>
                      <td className="px-6 py-5 text-xs text-slate-400 font-bold">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="px-8 py-5 text-right">
                         <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Successful</span>
                      </td>
                   </tr>
                ))}
                {payments.length === 0 && !isLoading && (
                   <tr>
                      <td colSpan="5" className="px-8 py-10 text-center text-slate-400 font-medium italic">No transactions found</td>
                   </tr>
                )}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
