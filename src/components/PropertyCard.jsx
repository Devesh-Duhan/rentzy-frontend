import Link from "next/link";
import dynamic from "next/dynamic";
import { Heart, MapPin, Bed, Bath, Square, ChevronRight } from "lucide-react";
import { useState } from "react";
const PropertyImageSwiper = dynamic(() => import("./PropertyImageSwiper"), { ssr: false });

const PropertyCard = ({
  id, title, location, price, images, image, type, purpose, isNew,
  hasPrivateMedia, furnishing, postedBy, pricePerSqft, layout = "grid",
  trustScore, sellerId, bhk, bathrooms, area,
}) => {
  const [saved, setSaved] = useState(false);
  const typeStr = Array.isArray(type) ? type[0] || "" : (typeof type === "string" ? type : String(type ?? ""));
  const locationStr = typeof location === "object" && location !== null
    ? [location.address, location.city, location.state, location.zipcode].filter(Boolean).join(", ") || "Location not specified"
    : location || "Location not specified";

  if (layout === "list") {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex flex-col md:flex-row group">
        <div className="relative h-48 md:h-auto md:w-[280px] flex-shrink-0 overflow-hidden">
          <PropertyImageSwiper images={images?.length ? images : image ? [image] : []} alt={title} />
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
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-3 mb-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{title}</h3>
            <button onClick={() => setSaved(!saved)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0">
              <Heart size={18} className={saved ? "fill-rose-500 text-rose-500" : "text-slate-300 dark:text-slate-600"} />
            </button>
          </div>
          <p className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm mb-3">
            <MapPin size={14} className="text-indigo-500 flex-shrink-0" />
            {locationStr}
          </p>
          <div className="flex items-center gap-4 mb-3 text-slate-600 dark:text-slate-300 text-sm">
            {bhk && <span className="flex items-center gap-1"><Bed size={14} />{bhk} BHK</span>}
            {bathrooms && <span className="flex items-center gap-1"><Bath size={14} />{bathrooms}</span>}
            {area && <span className="flex items-center gap-1"><Square size={14} />{area} sqft</span>}
          </div>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">₹{price}</span>
            {purpose !== "sell" && <span className="text-xs text-slate-400">/mo</span>}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {furnishing && (
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{furnishing}</span>
            )}
            {pricePerSqft && (
              <span className="text-[10px] font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">₹{pricePerSqft}/sqft</span>
            )}
          </div>
          <div className="flex gap-2 mt-auto">
            <a href="tel:+919999999999" className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all text-center">
              Call Owner
            </a>
            <Link href={`/properties/${id}`} className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition-all">
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="property-card group">
      <Link href={`/properties/${id}`}>
        <div className="property-card-image">
          <PropertyImageSwiper images={images?.length ? images : image ? [image] : []} alt={title} />
          <div className="absolute top-3 left-3 z-10 flex gap-1.5">
            <span className="px-2.5 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-lg">{typeStr}</span>
            {isNew && <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-lg animate-pulse">New</span>}
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
          <button
            onClick={(e) => { e.preventDefault(); setSaved(!saved); }}
            className="absolute bottom-3 right-3 z-10 w-8 h-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all"
          >
            <Heart size={15} className={saved ? "fill-rose-500 text-rose-500" : "text-slate-400"} />
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</h3>
          <p className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-3">
            <MapPin size={12} className="text-indigo-500 flex-shrink-0" />
            {locationStr}
          </p>
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs mb-3">
            {bhk && <span className="flex items-center gap-1"><Bed size={12} />{bhk}</span>}
            {bathrooms && <span className="flex items-center gap-1"><Bath size={12} />{bathrooms}</span>}
            {area && <span className="flex items-center gap-1"><Square size={12} />{area}</span>}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">₹{price}</span>
            {purpose !== "sell" && <span className="text-[10px] text-slate-400">/mo</span>}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {furnishing && (
              <span className="text-[9px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{furnishing}</span>
            )}
            {pricePerSqft && (
              <span className="text-[9px] font-medium text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded">₹{pricePerSqft}/sqft</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;
