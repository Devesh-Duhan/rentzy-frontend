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

export default function PropertyCard({ id, _id, title, location, price, images, image, type, purpose, bedrooms, bhk, bathrooms, areaSqFt, area, furnishing, isVerified, isNew, isSaved = false, layout = 'grid' }) {
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
      <div className={`relative z-10 isolate shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 ${layout === 'list' ? 'aspect-[1.6] md:aspect-auto md:w-72' : 'aspect-[1.6]'}`}>
        <Link href={`/properties/${propertyId}`} aria-label={`View ${title || 'property'}`} className="absolute inset-0">
          {src && !brokenImage ? <Image src={src} alt={title || 'Property photo'} fill sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized={!/^https:\/\/(res\.cloudinary\.com|images\.unsplash\.com|plus\.unsplash\.com)\//.test(src)} onError={() => setBrokenImage(true)} /> : <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400"><ImageIcon size={30} /><span className="text-xs">Photos coming soon</span></div>}
        </Link>
        <div className="pointer-events-none absolute left-3 right-16 top-3 flex flex-wrap gap-1.5"><span className="rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-slate-800 backdrop-blur-sm">{sale ? 'For sale' : 'For rent'}</span>{isNew && <span className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[11px] font-semibold text-white">New</span>}</div>
        <button type="button" onClick={toggleSave} disabled={saving} aria-label={saved ? 'Remove from saved properties' : 'Save property'} aria-pressed={saved} className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-sm backdrop-blur-sm disabled:opacity-50"><Heart size={18} className={saved ? 'fill-rose-500 text-rose-500' : ''} /></button>
        {photos.length > 1 && <><button onClick={() => slide(-1)} aria-label="Previous property photo" className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-100 shadow-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"><ChevronLeft size={18} /></button><button onClick={() => slide(1)} aria-label="Next property photo" className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-100 shadow-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"><ChevronRight size={18} /></button><span className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-slate-950/60 px-2 py-1 text-[10px] font-medium text-white">{index + 1} / {photos.length}</span></>}
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex min-h-4 items-center justify-between gap-2"><span className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-indigo-600 dark:text-indigo-400">{propertyType(type).replace(/[_-]/g, ' ')}</span>{isVerified && <span className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-emerald-600"><BadgeCheck size={14} /> Verified</span>}</div>
        <h3 className="line-clamp-2 min-h-12 break-words text-base font-semibold leading-6 tracking-tight"><Link href={`/properties/${propertyId}`} className="after:absolute after:inset-0 after:cursor-pointer hover:text-indigo-600 focus-visible:after:rounded-2xl focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-indigo-500">{title || 'Untitled property'}</Link></h3>
        <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><MapPin size={13} className="shrink-0" /><span className="truncate">{locationLabel(location) || 'Location not specified'}</span></p>
        <div className="my-4 flex min-h-10 flex-wrap content-center items-center gap-x-3 gap-y-2 text-xs text-slate-500 dark:text-slate-400">{(bedrooms ?? bhk) > 0 && <span className="inline-flex items-center gap-1.5"><BedDouble size={15} className="shrink-0" /> {bedrooms ?? bhk} beds</span>}{bathrooms > 0 && <span className="inline-flex items-center gap-1.5"><Bath size={14} className="shrink-0" /> {bathrooms} baths</span>}{(areaSqFt || area) > 0 && <span className="inline-flex items-center gap-1.5"><Maximize size={13} className="shrink-0" /> {areaSqFt || area} sq ft</span>}{!bedrooms && !bhk && !areaSqFt && !area && furnishing && <span className="capitalize">{furnishing.replace(/-/g, ' ')}</span>}</div>
        <div className="mt-auto flex min-h-16 items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800"><p className="min-w-0"><span className="block break-words text-lg font-semibold tracking-tight [overflow-wrap:anywhere]">{formatMoney(numericPrice)}</span>{!sale && <span className="mt-0.5 block text-[11px] font-normal text-slate-500 dark:text-slate-400">per month</span>}</p><Link href={`/properties/${propertyId}`} aria-label={`View details of ${title || 'property'}`} className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white dark:bg-indigo-950"><ArrowUpRight size={18} /></Link></div>
      </div>
    </article>
  );
}
