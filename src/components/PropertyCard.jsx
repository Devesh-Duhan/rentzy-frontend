import Link from "next/link";
import dynamic from "next/dynamic";
import { Heart, MapPin, Bed, Bath, Square, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";

const PropertyImageSwiper = dynamic(() => import("./PropertyImageSwiper"), { ssr: false });

const PropertyCard = ({
  id, title, location, price, images, image, type, purpose, isNew,
  hasPrivateMedia, furnishing, postedBy, pricePerSqft, layout = "grid",
  trustScore, sellerId, bhk, bathrooms, area, contactNumber, phone, isSaved = false,
  areaSqFt, bedrooms, ...rest
}) => {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const [saved, setSaved] = useState(Boolean(isSaved));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSaved(Boolean(isSaved));
  }, [isSaved]);

  const ownerPhone = contactNumber || phone || (typeof sellerId === "object" ? sellerId?.phone : null);
  const typeStr = Array.isArray(type) ? type[0] || "" : (typeof type === "string" ? type : String(type ?? ""));
  const locationStr = typeof location === "object" && location !== null
    ? [location.address, location.city, location.state, location.zipcode].filter(Boolean).join(", ") || "Location not specified"
    : location || "Location not specified";

  const handleToggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }
    if (isSaving || !id) return;

    try {
      setIsSaving(true);
      const newSavedState = !saved;
      setSaved(newSavedState);
      await axiosInstance.post("/saved-properties", { propertyId: id });
    } catch (error) {
      console.error("Failed to toggle save property:", error);
      setSaved(!saved); // Revert on failure
    } finally {
      setIsSaving(false);
    }
  };

  const effectiveArea = area || areaSqFt || rest?.areaSqFt || rest?.area;
  const effectiveBhk = bhk || bedrooms || rest?.bedrooms || rest?.bhk;
  const rawPrice = typeof price === "number" ? price : Number(String(price || "").replace(/[^0-9.]/g, ""));
  const rawArea = typeof effectiveArea === "number" ? effectiveArea : Number(String(effectiveArea || "").replace(/[^0-9.]/g, ""));
  const effectivePricePerSqft = pricePerSqft || rest?.pricePerSqft || (rawPrice && rawArea && rawArea > 0 ? Math.round(rawPrice / rawArea) : null);

  if (layout === "list") {
    return (
      <div className="property-card group h-full w-full flex flex-col md:flex-row bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
        <div className="relative h-48 md:h-auto md:min-h-[200px] md:w-[280px] flex-shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
          <PropertyImageSwiper images={images} image={image} alt={title} />
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-lg">{typeStr}</span>
          </div>
          <div className="absolute top-3 right-3 z-10">
            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${purpose === "sell" ? "bg-amber-500 text-white" : "bg-indigo-600 text-white"}`}>
              {purpose === "sell" ? "For Sale" : "For Rent"}
            </div>
          </div>
          {postedBy && (
            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[9px] font-medium px-2 py-0.5 rounded-md z-10">
              {postedBy}
            </div>
          )}
        </div>
        <div className="p-5 flex-1 flex flex-col min-w-0">
          <div className="flex justify-between items-start gap-3 mb-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate min-w-0">{title}</h3>
            <button onClick={handleToggleSave} disabled={isSaving} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0">
              <Heart size={18} className={saved ? "fill-rose-500 text-rose-500" : "text-slate-300 dark:text-slate-600"} />
            </button>
          </div>
          <p className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm mb-3 h-5 min-h-[20px] max-h-[20px] overflow-hidden min-w-0">
            <MapPin size={14} className="text-indigo-500 flex-shrink-0" />
            <span className="truncate block flex-1 min-w-0">{locationStr}</span>
          </p>
          <div className="flex items-center gap-4 mb-3 text-slate-600 dark:text-slate-300 text-sm h-6 min-h-[24px] max-h-[24px] overflow-hidden min-w-0 whitespace-nowrap overflow-x-auto no-scrollbar">
            {Boolean(parseInt(effectiveBhk, 10)) && <span className="flex items-center gap-1 flex-shrink-0"><Bed size={14} />{effectiveBhk} BHK</span>}
            {Boolean(parseInt(bathrooms, 10)) && <span className="flex items-center gap-1 flex-shrink-0"><Bath size={14} />{bathrooms}</span>}
            {Boolean(parseInt(effectiveArea, 10)) && <span className="flex items-center gap-1 flex-shrink-0"><Square size={14} />{effectiveArea} sqft</span>}
            {furnishing && (
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md flex-shrink-0">{furnishing}</span>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 mb-4 h-8 min-h-[32px] max-h-[32px]">
            <div className="flex items-baseline gap-1 min-w-0">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 truncate">₹{price}</span>
              {purpose !== "sell" && <span className="text-xs text-slate-400 flex-shrink-0">/mo</span>}
            </div>
            {effectivePricePerSqft && (
              <span className="text-[11px] font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md whitespace-nowrap flex-shrink-0">
                ₹{effectivePricePerSqft}/sqft
              </span>
            )}
          </div>
          <div className="flex gap-2 mt-auto">
            {ownerPhone ? (
              <a href={`tel:${ownerPhone}`} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all text-center">
                Call Owner
              </a>
            ) : (
              <Link href={`/properties/${id}`} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all text-center">
                View Details
              </Link>
            )}
            <Link href={`/properties/${id}`} className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition-all">
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="property-card group w-full h-full flex flex-col bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700/50 card-shadow transition-all duration-300 hover:-translate-y-1">
      <Link href={`/properties/${id}`} className="flex flex-col flex-1 w-full min-w-0">
        <div className="relative w-full pt-[66.67%] overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800">
          <div className="absolute inset-0">
            <PropertyImageSwiper images={images} image={image} alt={title} />
          </div>
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex gap-1 sm:gap-1.5 pointer-events-none">
            <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-indigo-600 dark:text-indigo-400 text-[8px] sm:text-[10px] font-bold rounded sm:rounded-lg">{typeStr}</span>
            {isNew && <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-emerald-500 text-white text-[8px] sm:text-[10px] font-bold rounded sm:rounded-lg animate-pulse">New</span>}
          </div>
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 pointer-events-none">
            <div className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded sm:rounded-lg text-[8px] sm:text-[10px] font-bold ${purpose === "sell" ? "bg-amber-500 text-white" : "bg-indigo-600 text-white"}`}>
              {purpose === "sell" ? "For Sale" : "For Rent"}
            </div>
          </div>
          {postedBy && (
            <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-black/60 backdrop-blur-sm text-white text-[8px] sm:text-[9px] font-medium px-1.5 py-0.5 rounded pointer-events-none max-w-[65%] truncate">
              {postedBy}
            </div>
          )}
          <button
            onClick={handleToggleSave}
            disabled={isSaving}
            className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-10 w-6 h-6 sm:w-8 sm:h-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-sm"
          >
            <Heart size={13} className={saved ? "fill-rose-500 text-rose-500" : "text-slate-400"} />
          </button>
        </div>
        <div className="p-2.5 sm:p-4 flex-1 flex flex-col min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm truncate block w-full h-4 sm:h-5 leading-4 sm:leading-5 mb-0.5 sm:mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" title={title}>
            {title}
          </h3>
          <p className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs mb-1.5 sm:mb-2.5 h-3.5 sm:h-4 min-w-0 overflow-hidden">
            <MapPin size={11} className="text-indigo-500 flex-shrink-0" />
            <span className="truncate block flex-1 min-w-0">{locationStr}</span>
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs h-4 sm:h-5 overflow-hidden min-w-0 whitespace-nowrap">
            {Boolean(parseInt(effectiveBhk, 10)) && <span className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0"><Bed size={11} className="sm:w-3 sm:h-3" />{effectiveBhk}</span>}
            {Boolean(parseInt(bathrooms, 10)) && <span className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0"><Bath size={11} className="sm:w-3 sm:h-3" />{bathrooms}</span>}
            {Boolean(parseInt(effectiveArea, 10)) && <span className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0"><Square size={11} className="sm:w-3 sm:h-3" />{effectiveArea}</span>}
            {furnishing && (
              <span className="hidden xs:inline-block text-[8px] sm:text-[9px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded flex-shrink-0 capitalize">{furnishing}</span>
            )}
          </div>
          <div className="mt-auto pt-2 sm:pt-2.5 border-t border-slate-100 dark:border-slate-700/50 min-w-0">
            <div className="flex items-center justify-between gap-1 sm:gap-2 h-[24px] sm:h-[28px]">
              <div className="flex items-baseline gap-0.5 sm:gap-1 min-w-0">
                <span className="text-xs xs:text-sm sm:text-lg font-bold text-indigo-600 dark:text-indigo-400 truncate">₹{price}</span>
                {purpose !== "sell" && <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium flex-shrink-0">/mo</span>}
              </div>
              {effectivePricePerSqft && (
                <span className="hidden sm:inline-block text-[10px] font-medium text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0">
                  ₹{effectivePricePerSqft}/sqft
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;
