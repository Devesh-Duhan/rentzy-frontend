"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { becomeSeller, reset } from "@/store/slices/authSlice";
import { toast } from "react-hot-toast";
import { Building2, MapPin, Phone, Briefcase, ChevronRight, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function BecomeSeller() {
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    company: "",
    experience: ""
  });

  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isLoading, isSuccess, isError, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/become-seller");
    }
    if (user?.role === "seller") {
      router.push("/seller");
    }
  }, [user, router]);

  useEffect(() => {
    if (isSuccess && user?.role === "seller") {
      toast.success("Congratulations! You are now a seller.");
      router.push("/seller");
    }
    if (isError) {
      toast.error(message);
    }
    dispatch(reset());
  }, [isSuccess, isError, message, user, router, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.phone || !formData.address || !formData.company) {
      toast.error("Please fill all required fields");
      return;
    }
    dispatch(becomeSeller(formData));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-10 font-bold text-sm group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Info Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="px-4 py-1.5 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">Growth Opportunity</span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.1]">
                Scale Your <span className="text-indigo-600">Business</span> with rentzypro
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
                Join our community of premium property owners and managers. Reach thousands of verified tenants every day.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { title: "Verified Leads", desc: "Get inquiries from high-intent local tenants.", icon: CheckCircle2 },
                { title: "Zero Commission", desc: "Keep 100% of your rental income. No hidden fees.", icon: CheckCircle2 },
                { title: "Advanced Dashboard", desc: "Manage listings and track performance easily.", icon: CheckCircle2 }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="mt-1 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <item.icon size={14} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Registration Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-10 shadow-2xl shadow-indigo-500/5 border border-slate-100 dark:border-white/5"
          >
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
              <Building2 className="text-indigo-600" /> Apply Today
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Business Name</label>
                <div className="relative">
                  <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Dream Homes Realty"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Contact Phone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98XXX XXXXX"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Experience Level</label>
                <div className="relative">
                  <ChevronRight size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none appearance-none focus:ring-4 focus:ring-indigo-100/50 transition-all cursor-pointer"
                  >
                    <option value="">Select Experience</option>
                    <option value="0-2 Years">0-2 Years</option>
                    <option value="3-5 Years">3-5 Years</option>
                    <option value="5-10 Years">5-10 Years</option>
                    <option value="10+ Years">10+ Years</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Office Address</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Full business address"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all resize-none"
                    required
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Unlock Seller Features"} <ChevronRight size={20} />
              </button>

              <p className="text-[10px] text-slate-400 text-center font-bold px-4 leading-relaxed tracking-wider uppercase">
                By clicking "Unlock Seller Features", you agree to our Seller Terms and verify that the provided details are accurate.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
