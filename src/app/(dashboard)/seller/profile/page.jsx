"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, MapPin, Camera, Save, ShieldCheck, Loader2, Building2, Clock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, reset } from "@/store/slices/authSlice";
import { toast } from "react-hot-toast";

export default function SellerProfile() {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { user, isLoading, isSuccess, isError, message } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
    experience: ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        company: user.company || "",
        experience: user.experience || ""
      });
      setImagePreview(user.profileImage || "");
    }
  }, [user]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Profile updated successfully");
      dispatch(reset());
    }
    if (isError) {
      toast.error(message || "Something went wrong");
      dispatch(reset());
    }
  }, [isSuccess, isError, message, dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("name", profile.name);
    formData.append("email", profile.email);
    formData.append("phone", profile.phone);
    formData.append("address", profile.address);
    formData.append("company", profile.company);
    formData.append("experience", profile.experience);
    if (imageFile) {
      formData.append("profileImage", imageFile);
    }
    dispatch(updateProfile(formData));
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="section-title">Business Profile</h2>
      </div>

      <div className="app-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <ShieldCheck size={100} />
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-8">
          <div className="relative group">
            <div className="w-28 h-28 bg-slate-100 dark:bg-white/5 rounded-2xl overflow-hidden flex items-center justify-center text-slate-400 text-4xl font-bold shadow-lg relative">
              {imagePreview ? (
                <Image src={imagePreview} alt="Profile" width={112} height={112} className="w-full h-full object-cover" unoptimized />
              ) : (
                <span className="uppercase">{profile.name?.charAt(0) || "U"}</span>
              )}
              {isLoading && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2.5 bg-white dark:bg-slate-800 shadow-xl rounded-xl text-slate-400 hover:text-indigo-600 transition-all border border-slate-100 dark:border-slate-700 group-hover:scale-110 active:scale-95"
            >
              <Camera size={16} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{profile.name}</h3>
            <p className="text-sm text-slate-500 font-semibold flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-emerald-500" /> Verified Premium Seller
            </p>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">REAL ESTATE AGENT</span>
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">{profile.experience || "0 Years"} EXP</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="input-field !pl-10" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="input-field !pl-10" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="input-field !pl-10" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Business Name</label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} className="input-field !pl-10" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Years of Experience</label>
            <div className="relative">
              <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: e.target.value })} placeholder="e.g. 5 Years" className="input-field !pl-10" />
            </div>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Full Address</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="input-field !pl-10" />
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end border-t border-slate-100 pt-6 dark:border-slate-700/50">
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="btn-primary flex w-full items-center justify-center gap-2 text-sm py-3.5 shadow-lg sm:w-auto"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
