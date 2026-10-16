"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Heart, MapPin, BedDouble, Bath, Maximize, ArrowUpRight, ChevronLeft, ChevronRight, ImageIcon, BadgeCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '@/lib/axios';
import { formatMoney, isSale, locationLabel, propertyType } from '@/lib/property';

export default function PropertyCard({ id, _id, title, location, price, images, image, type, purpose, bedrooms, bhk, bathrooms, areaSqFt, area, furnishing, isVerified, isNew, isSaved = false, layout = 'grid', compact = false }) {
  const propertyId = id || _id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSelector(state => state.auth);
  const [saved, setSaved] = useState(isSaved);
  const [saving, setSaving] = useState(false);
  const [index, setIndex] = useState(0);
  const [brokenImage, setBrokenImage] = useState(false);
  const photos = [...new Set([...(Array.isArray(images) ? images : []), image].filter(Boolean))];
  const src = photos[index] || photos[0];
  const numericPrice = typeof price === 'number' ? price : Number(String(price || '').replace(/[^\d.]/g, ''));
  const sale = isSale(purpose);
  const badgeClasses = compact ? 'px-1.5 py-1 text-[9px] sm:px-2.5 sm:py-1.5 sm:text-[11px]' : 'px-2.5 py-1.5 text-[11px]';
  const photoControlClasses = compact ? 'bottom-2 h-7 w-7 sm:bottom-auto sm:top-1/2 sm:h-9 sm:w-9 sm:-translate-y-1/2' : 'top-1/2 h-9 w-9 -translate-y-1/2';
  const factClasses = `inline-flex items-center ${compact ? 'gap-1 sm:gap-1.5' : 'gap-1.5'}`;
  useEffect(() => { setSaved(isSaved); }, [isSaved, propertyId]);
  useEffect(() => { setIndex(0); setBrokenImage(false); }, [propertyId]);
  async function toggleSave() {
    if (!user) { router.push('/login'); return; }
    if (saving || !propertyId) return;
    setSaving(true);
    try {
      const { data } = await axios.post('/saved-properties', { propertyId });
      setSaved(Boolean(data.saved));
      queryClient.setQueryData(['saved-property-status', user._id, propertyId], { saved: Boolean(data.saved) });
      queryClient.invalidateQueries({ queryKey: ['savedProperties'] });
      toast.success(data.saved ? 'Property saved' : 'Removed from saved properties');
    } catch (error) { toast.error(error.response?.data?.message || 'Could not update saved properties'); }
    finally { setSaving(false); }
  }
  function slide(direction) { setIndex(value => (value + direction + photos.length) % photos.length); setBrokenImage(false); }
  return (
    <article className={`group relative isolate flex h-full w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-shadow hover:shadow-[0_12px_36px_-16px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-900 ${layout === 'list' ? 'flex-col md:flex-row' : 'flex-col'}`}>
      <div className={`relative z-10 isolate shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 ${layout === 'list' ? 'aspect-[1.6] md:aspect-auto md:w-72' : compact ? 'aspect-[1.25] sm:aspect-[1.6]' : 'aspect-[1.6]'}`}>
        <Link href={`/properties/${propertyId}`} aria-label={`View ${title || 'property'}`} className="absolute inset-0">
          {src && !brokenImage ? <Image src={src} alt={title || 'Property photo'} fill sizes={compact ? '(min-width: 1024px) 400px, 50vw' : '(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw'} className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized={!/^https:\/\/(res\.cloudinary\.com|images\.unsplash\.com|plus\.unsplash\.com)\//.test(src)} onError={() => setBrokenImage(true)} /> : <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400"><ImageIcon size={30} /><span className="text-xs">Photos coming soon</span></div>}
        </Link>
        <div className={`pointer-events-none absolute flex flex-wrap ${compact ? 'left-2 right-12 top-2 gap-1 sm:left-3 sm:right-16 sm:top-3 sm:gap-1.5' : 'left-3 right-16 top-3 gap-1.5'}`}><span className={`rounded-lg bg-white/95 font-semibold text-slate-800 backdrop-blur-sm ${badgeClasses}`}>{sale ? 'For sale' : 'For rent'}</span>{isNew && <span className={`rounded-lg bg-indigo-600 font-semibold text-white ${badgeClasses}`}>New</span>}</div>
        <button type="button" onClick={toggleSave} disabled={saving} aria-label={saved ? 'Remove from saved properties' : 'Save property'} aria-pressed={saved} className={`absolute flex items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-sm backdrop-blur-sm disabled:opacity-50 ${compact ? 'right-2 top-2 h-8 w-8 sm:right-3 sm:top-3 sm:h-11 sm:w-11' : 'right-3 top-3 h-11 w-11'}`}><Heart size={18} className={saved ? 'fill-rose-500 text-rose-500' : ''} /></button>
        {photos.length > 1 && <><button onClick={() => slide(-1)} aria-label="Previous property photo" className={`absolute left-2 flex items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-100 shadow-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 ${photoControlClasses}`}><ChevronLeft size={18} /></button><button onClick={() => slide(1)} aria-label="Next property photo" className={`absolute right-2 flex items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-100 shadow-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 ${photoControlClasses}`}><ChevronRight size={18} /></button><span className={`pointer-events-none absolute rounded-md bg-slate-950/60 font-medium text-white ${compact ? 'bottom-2.5 right-1/2 translate-x-1/2 px-1 py-0.5 text-[9px] sm:bottom-3 sm:right-3 sm:translate-x-0 sm:px-2 sm:py-1 sm:text-[10px]' : 'bottom-3 right-3 px-2 py-1 text-[10px]'}`}>{index + 1} / {photos.length}</span></>}
      </div>
      <div className={`flex min-w-0 flex-1 flex-col ${compact ? 'p-2.5 sm:p-5' : 'p-4 sm:p-5'}`}>
        <div className={`flex min-h-4 items-center justify-between gap-2 ${compact ? 'mb-1 sm:mb-2' : 'mb-2'}`}><span className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-indigo-600 dark:text-indigo-400">{propertyType(type).replace(/[_-]/g, ' ')}</span>{isVerified && <span className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-emerald-600"><BadgeCheck size={14} /><span className={compact ? 'sr-only sm:not-sr-only' : undefined}>Verified</span></span>}</div>
        <h3 className={`line-clamp-2 break-words font-semibold tracking-tight ${compact ? 'min-h-9 text-[13px] leading-[18px] sm:min-h-12 sm:text-base sm:leading-6' : 'min-h-12 text-base leading-6'}`}><Link href={`/properties/${propertyId}`} className="after:absolute after:inset-0 after:cursor-pointer hover:text-indigo-600 focus-visible:after:rounded-2xl focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-indigo-500">{title || 'Untitled property'}</Link></h3>
        <p className={`flex min-w-0 items-center text-slate-500 dark:text-slate-400 ${compact ? 'mt-1 gap-1 text-[10px] sm:mt-2 sm:gap-1.5 sm:text-xs' : 'mt-2 gap-1.5 text-xs'}`}><MapPin size={13} className="shrink-0" /><span className="truncate">{locationLabel(location) || 'Location not specified'}</span></p>
        <div className={`flex flex-wrap content-center items-center text-slate-500 dark:text-slate-400 ${compact ? 'my-2 min-h-7 gap-x-2 gap-y-1 text-[10px] sm:my-4 sm:min-h-10 sm:gap-x-3 sm:gap-y-2 sm:text-xs' : 'my-4 min-h-10 gap-x-3 gap-y-2 text-xs'}`}>{(bedrooms ?? bhk) > 0 && <span className={factClasses}><BedDouble size={15} className="shrink-0" /> {bedrooms ?? bhk} beds</span>}{bathrooms > 0 && <span className={factClasses}><Bath size={14} className="shrink-0" /> {bathrooms} baths</span>}{(areaSqFt || area) > 0 && <span className={factClasses}><Maximize size={13} className="shrink-0" /> {areaSqFt || area} sq ft</span>}{!bedrooms && !bhk && !areaSqFt && !area && furnishing && <span className="capitalize">{furnishing.replace(/-/g, ' ')}</span>}</div>
        <div className={`mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800 ${compact ? 'min-h-12 gap-2 pt-2 sm:min-h-16 sm:gap-3 sm:pt-3' : 'min-h-16 gap-3 pt-3'}`}><p className="min-w-0"><span className={`block break-words font-semibold tracking-tight [overflow-wrap:anywhere] ${compact ? 'text-sm sm:text-lg' : 'text-lg'}`}>{formatMoney(numericPrice)}</span>{!sale && <span className={`mt-0.5 block font-normal text-slate-500 dark:text-slate-400 ${compact ? 'text-[10px] sm:text-[11px]' : 'text-[11px]'}`}>per month</span>}</p><Link href={`/properties/${propertyId}`} aria-label={`View details of ${title || 'property'}`} className={`relative z-10 flex shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white dark:bg-indigo-950 ${compact ? 'h-8 w-8 sm:h-11 sm:w-11' : 'h-11 w-11'}`}><ArrowUpRight size={18} /></Link></div>
      </div>
    </article>
  );
}
