"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Plus, MapPin, Building2, Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getAllPropertiesAdmin, reset } from "@/store/slices/propertySlice";
import axios from "@/lib/axios";
import { Toast, NewListingModal, DeleteConfirmationModal } from "../_components/AdminComponents";

export default function PropertiesSection() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { properties: backendProperties, isLoading, isError, message } = useSelector(state => state.property);
  
  const [properties, setProperties] = useState([]);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [listingForm, setListingForm] = useState({ title: "", type: "Apartment", location: "", rent: "", contact: "" });
  const [previewImage, setPreviewImage] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ id: null, name: "", type: "Property" });

  useEffect(() => {
    dispatch(getAllPropertiesAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (backendProperties) {
      const mapped = backendProperties.map(p => ({
        id: p._id,
        title: p.title,
        location: typeof p.location === 'object' ? `${p.location.city}, ${p.location.state}` : p.location,
        rent: p.price,
        status: "Verified",
        type: p.type,
        image: p.images && p.images[0] ? p.images[0] : null
      }));
      setProperties(mapped);
    }
  }, [backendProperties]);

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setListingForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePropertyEdit = (property) => {
    router.push(`/add?admin=true&edit=${property.id}`);
  };

  const handlePropertyDelete = (id) => {
    const prop = backendProperties.find(p => p._id === id);
    if (prop) {
      setDeleteConfig({ id: prop._id, name: prop.title, type: "Property" });
      setIsDeleteModalOpen(true);
    }
  };

  const handleSellerDelete = (seller) => {
    if (seller) {
      setDeleteConfig({ id: seller._id, name: seller.name, type: "Seller" });
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteConfig.type === "Property") {
        await axios.delete(`/admin/properties/${deleteConfig.id}`);
        showNotification("Property deleted!", "info");
      } else if (deleteConfig.type === "Seller") {
        await axios.delete(`/admin/users/${deleteConfig.id}`);
        showNotification("Seller deleted!", "info");
      }
      dispatch(getAllPropertiesAdmin());
    } catch (error) {
      showNotification("Delete failed!", "error");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Properties</h2>
        <button
          onClick={() => router.push("/add?admin=true")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg"
        >
          <Plus size={18} /> Add Property
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {backendProperties.map((property) => (
          <div key={property._id} className="bg-white dark:bg-slate-800/40 p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center hover:shadow-lg transition-all group">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-xl md:rounded-3xl overflow-hidden shrink-0 border border-slate-100 dark:border-white/5 shadow-inner">
              {property.images?.[0] ? (
                <Image src={property.images[0]} width={112} height={112} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                  <i className="fas fa-image text-slate-300 dark:text-slate-600"></i>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-[8px] font-black text-indigo-600 rounded-lg uppercase tracking-widest">{property.type}</span>
                <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${property.status === "available" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                  {property.status}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-2 truncate">{property.title}</h4>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">
                <MapPin size={10} className="text-indigo-500" /> {property.location?.address}, {property.location?.city}
              </div>

              {/* Seller Details Card */}
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-lg">
                    {property.sellerId?.profileImage ? <Image src={property.sellerId.profileImage} width={40} height={40} className="w-full h-full object-cover rounded-xl" unoptimized /> : property.sellerId?.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate">{property.sellerId?.name || 'Admin Listing'}</p>
                    <p className="text-[9px] font-bold text-slate-400 lowercase truncate">{property.sellerId?.email || 'No email'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 flex-1 justify-end">
                  {property.contactNumber && (
                    <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-lg text-[9px] font-black border border-emerald-100 dark:border-emerald-500/20 whitespace-nowrap">
                      PH: {property.contactNumber}
                    </div>
                  )}
                  <button 
                    onClick={() => handleSellerDelete(property.sellerId)}
                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                    title="Delete Seller Account"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:gap-3 shrink-0 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50 dark:border-white/5 pl-0 md:pl-6">
                <div className="mr-0 md:mr-4 text-left md:text-right flex-1 md:flex-none">
                   <p className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Monthly Rent</p>
                   <div className="flex items-center gap-2">
                     <p className="text-sm md:text-xl font-black text-indigo-600 dark:text-indigo-400">₹{property.price?.toLocaleString()}</p>
                     {(property.pricePerSqft || (property.areaSqFt ? Math.round(property.price / property.areaSqFt) : null)) && (
                       <span className="text-[10px] font-medium text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                         ₹{property.pricePerSqft || Math.round(property.price / property.areaSqFt)}/sqft
                       </span>
                     )}
                   </div>
                </div>
              <button onClick={() => handlePropertyEdit({ id: property._id })} className="p-3 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                <Edit2 size={18} />
              </button>
              <button onClick={() => handlePropertyDelete(property._id)} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleConfirmDelete} 
        itemName={deleteConfig.name} 
        type={deleteConfig.type} 
      />
      <Toast toast={toast} />
    </div>
  );
}
