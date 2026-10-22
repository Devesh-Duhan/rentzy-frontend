"use client";
import ContentSkeleton from "@/components/ContentSkeleton";


import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ChevronRight,
  ChevronLeft,
  Info,
  IndianRupee,
  Camera,
  MapPin,
  CheckCircle2,
  Upload,
  X,
  Building2,
  Edit2,
  Users,
  Home,
  Loader2,
  ShieldCheck
} from "lucide-react";
import Footer from "@/components/Footer";
import { addProperty } from "@/utils/propertyStore";
import { createProperty } from "@/store/slices/propertySlice";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";

const AddPropertyPage = () => {
  const router = useRouter();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const editId = searchParams?.get('edit');
  const isAdminFlow = searchParams?.get('admin') === 'true';
  const { user } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [furthestStep, setFurthestStep] = useState(1);
  const [previews, setPreviews] = useState([]);
  const [privatePreviews, setPrivatePreviews] = useState([]);
  const [form, setForm] = useState({
    title: "",
    type: ["Apartment"],
    district: "",
    location: "",
    rent: "",
    deposit: "",
    size: "",
    sizeUnit: "sqft",
    bedrooms: "N/A",
    bathrooms: "N/A",
    description: "",
    purpose: ["rent"],
    contactNumber: "",
    totalRooms: "",
    availableRooms: "",
    bookedRooms: ""
  });

  const [files, setFiles] = useState([]);
  const [privateFiles, setPrivateFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadedEditId, setLoadedEditId] = useState(null);
  const [editError, setEditError] = useState(false);
  const [editAttempt, setEditAttempt] = useState(0);
  const editLoading = !!editId && loadedEditId !== editId && !editError;
  const editBlocked = !!editId && (loadedEditId !== editId || editError);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isPaymentSelection, setIsPaymentSelection] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState(null);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const fetchCategoriesList = async () => {
      try {
        const { data } = await axiosInstance.get("/categories");
        const list = Array.isArray(data) ? data : data?.data || data?.categories || [];
        if (list.length > 0) {
          setCategories(list);
        }
      } catch (err) {
        console.error("Failed to load categories in add property:", err);
      }
    };
    fetchCategoriesList();
  }, []);

  useEffect(() => {
    let active = true;
    setEditError(false);
    if (editId) {
      const fetchProperty = async () => {
        try {
          const { data } = await axiosInstance.get(`/properties/my/${editId}`);
          if (!active) return;
          setForm({
            title: data.title,
            type: Array.isArray(data.type) ? data.type.map(t => t.charAt(0).toUpperCase() + t.slice(1)) : [data.type.charAt(0).toUpperCase() + data.type.slice(1)],
            district: data.location?.city || "",
            location: data.location?.address || "",
            rent: data.price,
            deposit: data.deposit || "",
            size: data.areaSqFt || "",
            sizeUnit: "sqft",
            bedrooms: (data.bedrooms || 0).toString(),
            bathrooms: (data.bathrooms || 0).toString(),
            description: data.description,
            purpose: Array.isArray(data.purpose) ? data.purpose : [data.purpose || 'rent'],
            totalRooms: data.totalRooms || "",
            availableRooms: data.availableRooms || "",
            bookedRooms: data.bookedRooms || "",
            contactNumber: data.contactNumber || ""
          });
          setPreviews(data.images || []);
          setCreatedPropertyId(data._id);
          setLoadedEditId(editId);
        } catch (e) {
          if (!active) return;
          setEditError(true);
          console.error(e);
          toast.error("Failed to fetch property details");
        }
      };
      fetchProperty();
    }
    return () => { active = false; };
  }, [editId, editAttempt]);

  const totalSteps = 4;
  const dispatch = useDispatch();
  const { isSuccess: creationSuccess, isError: creationError, message: creationMessage } = useSelector(state => state.property);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (prev.type.some(t => t.toLowerCase().includes('pg'))) {
        if (name === 'totalRooms' || name === 'bookedRooms') {
          const total = Number(name === 'totalRooms' ? value : prev.totalRooms) || 0;
          const booked = Number(name === 'bookedRooms' ? value : prev.bookedRooms) || 0;
          updated.availableRooms = Math.max(0, total - booked);
        }
      }
      return updated;
    });
  };

  const toggleFormValue = (field, value) => {
    setForm(prev => {
      const current = prev[field] || [];
      if (current.includes(value)) {
        if (current.length <= 1) return prev;
        return { ...prev, [field]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length + previews.length > 10) { toast.error("Maximum 10 images allowed"); return; }
    const invalidFiles = selectedFiles.filter(file => !ALLOWED_TYPES.includes(file.type));
    if (invalidFiles.length > 0) { toast.error("Invalid file type. Only JPG, PNG and WEBP are allowed."); return; }
    const largeFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (largeFiles.length > 0) { toast.error("Some images exceed the 5MB size limit."); return; }
    setFiles([...files, ...selectedFiles]);
    const newPreviews = selectedFiles.map((file) => {
      const reader = new FileReader();
      return new Promise((resolve) => { reader.onload = (e) => resolve(e.target.result); reader.readAsDataURL(file); });
    });
    Promise.all(newPreviews).then((images) => { setPreviews([...previews, ...images]); });
  };

  const removeImage = (index) => {
    const fileIndex = previews.slice(0, index).filter(src => src.startsWith('data:')).length;
    if (previews[index]?.startsWith('data:')) setFiles(files.filter((_, i) => i !== fileIndex));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handlePrivateImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length + privatePreviews.length > 10) { toast.error("Maximum 10 images allowed for exterior media"); return; }
    const invalidFiles = selectedFiles.filter(file => !ALLOWED_TYPES.includes(file.type));
    if (invalidFiles.length > 0) { toast.error("Invalid file type. Only JPG, PNG and WEBP are allowed."); return; }
    const largeFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (largeFiles.length > 0) { toast.error("Some images exceed the 5MB size limit."); return; }
    setPrivateFiles([...privateFiles, ...selectedFiles]);
    const newPreviews = selectedFiles.map((file) => {
      const reader = new FileReader();
      return new Promise((resolve) => { reader.onload = (e) => resolve(e.target.result); reader.readAsDataURL(file); });
    });
    Promise.all(newPreviews).then((images) => { setPrivatePreviews([...privatePreviews, ...images]); });
  };

  const removePrivateImage = (index) => {
    setPrivatePreviews(privatePreviews.filter((_, i) => i !== index));
    setPrivateFiles(privateFiles.filter((_, i) => i !== index));
  };

  // Listing checkout is temporarily disabled by the backend's free-listing mode.
  // New/updated listings return isPaid=true and skip the checkout below.
  // Retain both gateways; LISTING_PAYMENT_REQUIRED=true restores this flow later.
  const loadRazorpayScript = () => new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const loadCashfreeScript = () => new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleRazorpayPayment = async () => {
    try {
      setIsPaying(true);
      const res = await loadRazorpayScript();
      if (!res) { toast.error('Razorpay SDK failed to load.'); return; }
      const { data: order } = await axiosInstance.post('/properties/create-listing-order', { propertyId: createdPropertyId });
      const options = {
        key: order.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'RentzyPro',
        description: 'Property Listing Fee',
        order_id: order.id,
        handler: async function (response) {
          try {
            await axiosInstance.post('/properties/verify-listing-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              propertyId: createdPropertyId,
              amount: order.amount / 100
            });
            toast.success("Payment Received! Property is awaiting admin verification.");
            router.push(isAdminFlow ? "/admin/properties" : "/seller/properties");
          } catch (error) { toast.error("Payment verification failed!"); }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#4f46e5' },
        modal: { ondismiss: function () { toast.error("Payment cancelled."); } }
      };
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) { toast.error("Error initiating Razorpay"); }
    finally { setIsPaying(false); }
  };

  const handleCashfreePayment = async () => {
    try {
      setIsPaying(true);
      const res = await loadCashfreeScript();
      if (!res) { toast.error('Cashfree SDK failed to load.'); return; }
      const response = await axiosInstance.post('/properties/create-cashfree-listing-order', { propertyId: createdPropertyId });
      const { payment_session_id, order_id } = response.data;
      const cashfree = window.Cashfree({ mode: ['PROD', 'PRODUCTION'].includes((process.env.NEXT_PUBLIC_CASHFREE_ENV || '').toUpperCase()) ? 'production' : 'sandbox' });
      await cashfree.checkout({ paymentSessionId: payment_session_id, redirectTarget: "_modal" }).then(async (result) => {
        if (result.error) toast.error(result.error.message);
        if (result.paymentDetails) {
          try {
            await axiosInstance.post('/properties/verify-cashfree-listing-payment', { order_id, propertyId: createdPropertyId });
            toast.success("Payment Received! Property is awaiting admin verification.");
            router.push(isAdminFlow ? "/admin/properties" : "/seller/properties");
          } catch (error) { toast.error("Payment verification failed!"); }
        }
      });
    } catch (error) { toast.error("Error initiating Cashfree"); }
    finally { setIsPaying(false); }
  };

  const handleSubmit = async () => {
    if (isSubmitting || editBlocked) return;
    for (let currentStep = 1; currentStep < totalSteps; currentStep++) {
      if (!validateStep(currentStep)) {
        setStep(currentStep);
        return;
      }
    }
    setIsSubmitting(true);
    try {
      if (user) {
        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("price", Number(form.rent));
        formData.append("deposit", Number(form.deposit));
        formData.append("city", form.district);
        formData.append("address", form.district);
        form.type.forEach(t => { let normalizedType = t.toLowerCase(); if (normalizedType.includes('pg')) normalizedType = 'pg_hostel'; formData.append("type", normalizedType); });
        formData.append("areaSqFt", Number(form.size));
        formData.append("bedrooms", form.bedrooms === "N/A" ? 0 : Number(form.bedrooms));
        formData.append("bathrooms", form.bathrooms === "N/A" ? 0 : Number(form.bathrooms));
        form.purpose.forEach(p => { formData.append("purpose", p === 'For sell' || p === 'sell' ? 'sell' : 'rent'); });
        formData.append("contactNumber", form.contactNumber);
        if (form.type.some(t => t.toLowerCase().includes('pg'))) {
          formData.append("totalRooms", Number(form.totalRooms));
          formData.append("availableRooms", Number(form.availableRooms));
          formData.append("bookedRooms", Number(form.bookedRooms));
        }
        files.forEach(file => formData.append("images", file));
        privateFiles.forEach(file => formData.append("images", file));
        if (editId) {
          formData.append('existingImages', JSON.stringify(previews.filter(src => !src.startsWith('data:'))));
          const { data } = await axiosInstance.put(`/properties/${editId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
          if (!data.isPaid) {
            setCreatedPropertyId(data._id);
            setIsPaymentSelection(true);
            toast.success('Property saved. Complete payment, then await admin verification.');
            return;
          }
          toast.success("Property updated. Admin verification is required before it appears publicly.");
          router.push(isAdminFlow ? "/admin/properties" : "/seller/properties");
        } else {
          const response = await axiosInstance.post('/properties', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
          if (!response.data.property.isPaid) {
            setCreatedPropertyId(response.data.property._id);
            setIsPaymentSelection(true);
            toast.success('Property saved. Complete payment, then await admin verification.');
            return;
          }
          toast.success("Property submitted for admin verification!");
          router.push(isAdminFlow ? "/admin/properties" : "/seller/properties");
        }
      } else {
        addProperty({ ...form, image: previews[0], hasPrivateMedia: privatePreviews.length > 0 });
        toast.success("Saved locally! Login to save permanently.");
        router.push("/");
      }
    } catch (error) {
      console.error("Publication failed:", error);
      toast.error(error?.response?.data?.message || "Failed to publish property");
    } finally { setIsSubmitting(false); }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!form.title.trim()) newErrors.title = "Title is required";
      if (!form.district.trim()) newErrors.district = "District is required";
      if (!form.description.trim() || form.description.length < 20) newErrors.description = "Detailed description (min 20 chars) is required";
      if (!form.contactNumber.trim()) newErrors.contactNumber = "Contact number is required";
      for (const field of ['bedrooms', 'bathrooms']) {
        if (form[field] !== '' && form[field] !== 'N/A' && (!Number.isSafeInteger(Number(form[field])) || Number(form[field]) < 0)) {
          newErrors[field] = `Enter a whole number of ${field} (0 or more).`;
        }
      }
      if (form.type.some(t => t.toLowerCase().includes('pg'))) {
        if (!form.totalRooms) newErrors.totalRooms = "Total rooms is required for PG/Hostels";
        if (!form.availableRooms) newErrors.availableRooms = "Available rooms is required for PG/Hostels";
      }
    } else if (currentStep === 2) {
      if (!form.rent) newErrors.rent = "Rent is required";
    } else if (currentStep === 3) {
      if (files.length === 0 && previews.length === 0) newErrors.files = "At least one property image is required";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0]);
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (isSubmitting || editBlocked || !validateStep(step)) return;
    const next = Math.min(step + 1, totalSteps);
    setFurthestStep(previous => Math.max(previous, next));
    setStep(next);
  };
  const goToStep = (target) => {
    if (isSubmitting || editBlocked || target > furthestStep || target === step) return;
    if (target > step) {
      for (let currentStep = 1; currentStep < target; currentStep++) {
        if (!validateStep(currentStep)) {
          setStep(currentStep);
          return;
        }
      }
    }
    setErrors({});
    setStep(target);
  };
  const prevStep = () => { setErrors({}); setStep(s => Math.max(s - 1, 1)); };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTo(0, 0);
    document.documentElement.scrollTo(0, 0);
    const timer = setTimeout(() => {
      const header = document.getElementById('property-form-header');
      if (header) header.scrollIntoView({ behavior: 'auto', block: 'start' });
    }, 60);
    return () => clearTimeout(timer);
  }, [step]);

  const STEPS = [
    { id: 1, label: "Basics", icon: Info },
    { id: 2, label: "Pricing", icon: IndianRupee },
    { id: 3, label: "Media", icon: Camera },
    { id: 4, label: "Review", icon: CheckCircle2 }
  ];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-600">What is your intent? <span className="text-rose-500">*</span></label>
              <div className="flex gap-3 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                {[{ label: 'For Rent', value: 'rent' }, { label: 'For Sale', value: 'sell' }].map((p) => (
                  <button key={p.value} type="button" onClick={() => setForm(prev => ({ ...prev, purpose: [p.value] }))}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${form.purpose.includes(p.value) ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-lg" : "text-slate-400 dark:text-slate-500 hover:text-slate-600"}`}
                  >{p.label}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-600">Property Title <span className="text-rose-500">*</span></label>
                <input name="title" value={form.title} onChange={handleInputChange} placeholder="e.g. Modern Apartment" className={`input-field ${errors.title ? "border-rose-500 ring-4 ring-rose-500/10" : ""}`} />
                {errors.title && <p className="text-xs font-medium text-rose-500">{errors.title}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-600">Property Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {(categories.length > 0
                    ? categories.map((c) => c.name)
                    : ["Apartment", "Villa", "Flat", "Room", "Shop", "Office", "Building", "Godown", "Land", "Residential", "Commercial", "Industrial", "PG & Hostels"]
                  ).map((type) => (
                    <button key={type} type="button" onClick={() => toggleFormValue('type', type)}
                      className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${form.type.includes(type) ? "bg-indigo-600 text-white shadow-lg scale-105" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50"}`}
                    >
                      {categories.find(c => c.name === type)?.icon && (
                        <span>{categories.find(c => c.name === type)?.icon}</span>
                      )}
                      <span>{type}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-600">District / City <span className="text-rose-500">*</span></label>
                <input name="district" value={form.district} onChange={handleInputChange} placeholder="e.g. Mumbai" className={`input-field ${errors.district ? "border-rose-500 ring-4 ring-rose-500/10" : ""}`} />
                {errors.district && <p className="text-xs font-medium text-rose-500">{errors.district}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-600">Contact Number <span className="text-rose-500">*</span></label>
                <input name="contactNumber" value={form.contactNumber} onChange={handleInputChange} placeholder="e.g. +91 9876543210" className={`input-field ${errors.contactNumber ? "border-rose-500 ring-4 ring-rose-500/10" : ""}`} />
                {errors.contactNumber && <p className="text-xs font-medium text-rose-500">{errors.contactNumber}</p>}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="property-bedrooms" className="text-xs font-bold uppercase tracking-wider text-indigo-600">Bedrooms</label>
                <div className="flex gap-1.5">
                  {["N/A", "1", "2", "3", "4", "5"].map((num) => (
                    <button key={num} type="button" onClick={() => setForm(f => ({ ...f, bedrooms: num }))}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${form.bedrooms === num ? "bg-indigo-600 text-white shadow-lg" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400"}`}
                    >{num === '5' ? '5+' : num}</button>
                  ))}
                </div>
                <input id="property-bedrooms" name="bedrooms" type="number" min="0" step="1" inputMode="numeric" value={form.bedrooms === 'N/A' ? '' : form.bedrooms} onChange={handleInputChange} placeholder="Enter bedrooms" aria-invalid={Boolean(errors.bedrooms)} aria-describedby={errors.bedrooms ? 'bedrooms-error' : undefined} className={`input-field ${errors.bedrooms ? 'border-rose-500 ring-4 ring-rose-500/10' : ''}`} />
                {errors.bedrooms && <p id="bedrooms-error" className="text-xs font-medium text-rose-500">{errors.bedrooms}</p>}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="property-bathrooms" className="text-xs font-bold uppercase tracking-wider text-indigo-600">Bathrooms</label>
                <div className="flex gap-1.5">
                  {["N/A", "1", "2", "3", "4"].map((num) => (
                    <button key={num} type="button" onClick={() => setForm(f => ({ ...f, bathrooms: num }))}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${form.bathrooms === num ? "bg-indigo-600 text-white shadow-lg" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400"}`}
                    >{num}</button>
                  ))}
                </div>
                <input id="property-bathrooms" name="bathrooms" type="number" min="0" step="1" inputMode="numeric" value={form.bathrooms === 'N/A' ? '' : form.bathrooms} onChange={handleInputChange} placeholder="Enter bathrooms" aria-invalid={Boolean(errors.bathrooms)} aria-describedby={errors.bathrooms ? 'bathrooms-error' : undefined} className={`input-field ${errors.bathrooms ? 'border-rose-500 ring-4 ring-rose-500/10' : ''}`} />
                {errors.bathrooms && <p id="bathrooms-error" className="text-xs font-medium text-rose-500">{errors.bathrooms}</p>}
              </div>
              <AnimatePresence>
                {form.type.some(t => t.toLowerCase().includes('pg')) && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-indigo-50/30 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100/50 dark:border-indigo-500/20 relative">
                    <div className="col-span-full mb-1"><h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />Dynamic Inventory Status</h4></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1"><Home size={12} /> Total Rooms</label><input name="totalRooms" type="number" value={form.totalRooms} onChange={handleInputChange} placeholder="e.g. 20" className="input-field" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Available Now</label><input name="availableRooms" type="number" value={form.availableRooms} onChange={handleInputChange} placeholder="e.g. 5" className="input-field" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1"><Users size={12} /> Booked</label><input name="bookedRooms" type="number" value={form.bookedRooms} onChange={handleInputChange} placeholder="e.g. 15" className="input-field" /></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-600">Description <span className="text-rose-500">*</span></label>
              <textarea name="description" value={form.description} onChange={handleInputChange} placeholder="Describe the unique features, neighborhood, and amenities..." rows={3} className={`input-field resize-none ${errors.description ? "border-rose-500 ring-4 ring-rose-500/10" : ""}`} />
              {errors.description && <p className="text-xs font-medium text-rose-500">{errors.description}</p>}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-600">{form.purpose.includes('rent') ? 'Monthly Rent' : 'Total Sale Price'} <span className="text-rose-500">*</span></label>
                <input name="rent" value={form.rent} onChange={handleInputChange} placeholder="e.g. 25000" type="number" className={`input-field ${errors.rent ? "border-rose-500 ring-4 ring-rose-500/10" : ""}`} />
                {errors.rent && <p className="text-xs font-medium text-rose-500">{errors.rent}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-600">{form.purpose.includes('rent') ? 'Security Deposit' : 'Expected Booking Amount'} <span className="text-slate-400 font-medium normal-case tracking-normal">(Optional)</span></label>
                <input name="deposit" value={form.deposit} onChange={handleInputChange} placeholder="e.g. 50000" type="number" className={`input-field ${errors.deposit ? "border-rose-500 ring-4 ring-rose-500/10" : ""}`} />
                {errors.deposit && <p className="text-xs font-medium text-rose-500">{errors.deposit}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-600">Property Size <span className="text-slate-400 font-medium normal-case tracking-normal">(Optional)</span></label>
                <div className="flex">
                  <input name="size" value={form.size} onChange={handleInputChange} placeholder="e.g. 1200" type="number" className={`flex-1 input-field rounded-r-none ${errors.size ? "border-rose-500 ring-4 ring-rose-500/10" : ""}`} />
                  <select name="sizeUnit" value={form.sizeUnit} onChange={handleInputChange} className="px-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-r-xl text-xs font-bold uppercase tracking-wider outline-none cursor-pointer">
                    <option value="sqft">Sq Ft</option>
                    <option value="sqm">Sq M</option>
                    <option value="yard">Yard</option>
                  </select>
                </div>
                {errors.size && <p className="text-xs font-medium text-rose-500">{errors.size}</p>}
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-600">Public Interior Photos (Max 10) <span className="text-rose-500">*</span></label>
              {errors.files && <p className="text-xs font-medium text-rose-500">{errors.files}</p>}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <label className="aspect-square bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group overflow-hidden">
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                  <Upload size={28} className="text-slate-400 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase text-center leading-tight tracking-wider text-slate-500">Upload Photos</span>
                  <span className="text-[8px] font-medium text-slate-400 mt-1">Max 5MB, JPG/PNG</span>
                </label>
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm group">
                    <Image src={src} alt="Preview" width={200} height={200} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" unoptimized />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1.5 right-1.5 w-7 h-7 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-rose-500 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-rose-500 hover:text-white"><X size={14} /></button>
                    {i === 0 && <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-bold uppercase rounded-full shadow-lg">Main</div>}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
            <div className="app-card p-6 relative">
              <button onClick={() => setStep(1)} className="absolute top-4 right-4 p-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600 hover:text-white flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider shadow-lg"><Edit2 size={12} /> Edit</button>
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-4 flex items-center gap-2 group"><Info size={14} /> Property Basics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div><p className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-0.5">Title</p><p className="font-semibold text-slate-900 dark:text-white">{form.title}</p></div>
                <div><p className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-0.5">Type</p><p className="font-semibold text-slate-900 dark:text-white">{form.type.join(', ')}</p></div>
                <div><p className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-0.5">City</p><p className="font-semibold text-slate-900 dark:text-white">{form.district}</p></div>
                <div><p className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-0.5">Bedrooms</p><p className="font-semibold text-slate-900 dark:text-white">{form.bedrooms || 'N/A'}</p></div>
                <div><p className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-0.5">Bathrooms</p><p className="font-semibold text-slate-900 dark:text-white">{form.bathrooms || 'N/A'}</p></div>
                <div><p className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-0.5">Purpose</p><p className="font-semibold text-slate-900 dark:text-white uppercase">{form.purpose.join(' & ')}</p></div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50"><p className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-0.5">Description</p><p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed line-clamp-3">{form.description}</p></div>
              {form.type.some(t => t.toLowerCase().includes('pg')) && (
                <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-500/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />Room Availability</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl"><p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Total</p><p className="text-lg font-bold text-slate-900 dark:text-white">{form.totalRooms || 0}</p></div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl"><p className="text-[10px] font-bold text-emerald-600 uppercase mb-0.5">Available</p><p className="text-lg font-bold text-emerald-700">{form.availableRooms || 0}</p></div>
                    <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-xl"><p className="text-[10px] font-bold text-rose-600 uppercase mb-0.5">Booked</p><p className="text-lg font-bold text-rose-700">{form.bookedRooms || 0}</p></div>
                  </div>
                </div>
              )}
            </div>
            <div className="app-card p-6 relative">
              <button onClick={() => setStep(2)} className="absolute top-4 right-4 p-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider shadow-lg"><Edit2 size={12} /> Edit</button>
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-4 flex items-center gap-2"><IndianRupee size={14} /> Pricing & Size</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div><p className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-0.5">Rent</p><p className="font-bold text-lg text-slate-900 dark:text-white">₹{Number(form.rent).toLocaleString()}</p></div>
                <div><p className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-0.5">Deposit</p><p className="font-bold text-lg text-slate-900 dark:text-white">₹{Number(form.deposit).toLocaleString()}</p></div>
                <div><p className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-0.5">Area</p><p className="font-bold text-lg text-slate-900 dark:text-white">{form.size} {form.sizeUnit}</p></div>
              </div>
            </div>
            <div className="app-card p-6 relative">
              <button onClick={() => setStep(3)} className="absolute top-4 right-4 p-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider shadow-lg"><Edit2 size={12} /> Edit</button>
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-4 flex items-center gap-2"><Camera size={14} /> Media</h3>
              <div className="flex gap-3 overflow-x-auto pb-3">
                {previews.map((src, i) => (
                  <div key={i} className="min-w-[100px] w-[100px] aspect-square rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                    <Image src={src} width={100} height={100} className="w-full h-full object-cover" alt="" unoptimized />
                  </div>
                ))}
                {privatePreviews.map((src, i) => (
                  <div key={`priv-${i}`} className="min-w-[100px] w-[100px] aspect-square rounded-xl overflow-hidden border-2 border-rose-500/30">
                    <Image src={src} width={100} height={100} className="w-full h-full object-cover blur-[1px]" alt="" unoptimized />
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 font-medium mt-2">{previews.length + privatePreviews.length} visuals uploaded{privatePreviews.length > 0 && <span className="text-rose-500 ml-1">({privatePreviews.length} private)</span>}</p>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {isPaymentSelection ? (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-effect p-8 md:p-12 rounded-3xl text-center">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><IndianRupee size={32} /></div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">Choose Payment Method</h1>
              <p className="section-subtitle mb-8 max-w-md mx-auto">Complete your listing fee to submit your property for admin verification.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={handleRazorpayPayment} disabled={isPaying} className="group relative overflow-hidden bg-indigo-600 p-6 rounded-2xl text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50">
                  <div className="relative z-10 flex flex-col items-center gap-3"><div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><CheckCircle2 size={22} /></div><span className="font-bold uppercase tracking-wider text-xs">Pay with Razorpay</span></div>
                </button>
                <button onClick={handleCashfreePayment} disabled={isPaying} className="group relative overflow-hidden bg-slate-900 p-6 rounded-2xl text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50">
                  <div className="relative z-10 flex flex-col items-center gap-3"><div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center"><IndianRupee size={22} /></div><span className="font-bold uppercase tracking-wider text-xs">Pay with Cashfree</span></div>
                </button>
              </div>
              {isPaying && <div className="mt-6 flex items-center justify-center gap-2 text-indigo-600 font-bold uppercase text-xs tracking-wider animate-pulse"><Loader2 className="animate-spin" size={16} /> Processing Payment...</div>}
            </motion.div>
          ) : (
            <>
              <div id="property-form-header" className="relative mb-8 md:mb-12 scroll-mt-24 text-center">
                <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 border border-indigo-100 dark:border-indigo-500/20">Seller Partner Portal</span>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">List Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Property</span></h1>
                <p className="section-subtitle text-sm max-w-lg mx-auto">{user ? "Reach thousands of potential tenants across our premium network instantly." : "Join our network of premium properties. Login to save your listings permanently."}</p>
              </div>

              <div className="flex items-center justify-between mb-8 px-2">
                {STEPS.map((s) => (
                  <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                    <button type="button" onClick={() => goToStep(s.id)} disabled={editBlocked || isSubmitting || s.id > furthestStep} aria-label={`Step ${s.id}: ${s.label}`} aria-current={step === s.id ? 'step' : undefined}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:cursor-not-allowed ${furthestStep >= s.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-110" : "bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-slate-700"}`}
                    ><s.icon size={18} /></button>
                  </div>
                ))}
              </div>

              <div className="glass-effect p-6 sm:p-8 md:p-10 rounded-3xl shadow-lg">
                {editLoading ? <ContentSkeleton label="Loading property for editing" count={3} itemClassName="h-20" /> : editError ? <div role="alert">Could not load this property. <button type="button" onClick={() => setEditAttempt(value => value + 1)} className="btn-secondary">Try again</button></div> : <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>}
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50">
                  <button onClick={prevStep} disabled={editBlocked || step === 1 || isSubmitting}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm ${step === 1 ? "hidden" : "btn-secondary"}`}
                  ><ChevronLeft size={16} /> Previous</button>
                  {step < totalSteps ? (
                    <button onClick={nextStep} disabled={editBlocked || isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-3.5 shadow-lg">Next Step <ChevronRight size={16} /></button>
                  ) : (
                    <button onClick={handleSubmit} disabled={editBlocked || isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-3.5 shadow-lg">
                      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                      {isSubmitting ? "Publishing..." : "Confirm & Publish"}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddPropertyPage;
