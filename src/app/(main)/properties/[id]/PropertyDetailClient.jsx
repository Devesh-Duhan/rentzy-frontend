"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { ArrowLeft, ArrowUpRight, Bath, BedDouble, Building2, Check, ChevronRight, FileText, Heart, Info, Loader2, MapPin, Maximize, MessageCircle, Phone, Send, ShieldCheck, Sofa, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '@/lib/axios';
import { cardProperty, contactPhone, formatMoney, isSale, locationLabel, propertyType } from '@/lib/property';
import PropertyDetailGallery from '@/components/PropertyDetailGallery';
import PropertyCard from '@/components/PropertyCard';
import PropertySchema from '@/components/PropertySchema';
import ShareProperty from '@/components/ShareProperty';
import ScheduleVisit from '@/components/ScheduleVisit';
import ReportProperty from '@/components/ReportProperty';
import Footer from '@/components/Footer';

const PropertyMap = dynamic(() => import('@/components/PropertyMap'), { ssr: false, loading: () => <div className="h-72 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" /> });

function Section({ id, title, children }) { return <section id={id} className="scroll-mt-28 border-b border-slate-200 py-8 last:border-0 sm:py-10 dark:border-slate-800"><h2 className="mb-5 text-xl font-semibold tracking-tight">{title}</h2>{children}</section>; }

export default function PropertyDetailClient({ id, initialData }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSelector(state => state.auth);
  const [origin, setOrigin] = useState(process.env.NEXT_PUBLIC_URL || '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contacting, setContacting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const { data: property, isPending, isError, error, refetch } = useQuery({
    queryKey: ['property-detail', id],
    queryFn: async ({ signal }) => (await axios.get(`/properties/${id}`, { signal })).data,
    initialData: initialData || undefined,
    staleTime: 60000,
    retry: 1,
  });
  const { data: reviews = [], isError: reviewError, refetch: retryReviews } = useQuery({ queryKey: ['property-reviews', id], queryFn: async ({ signal }) => { const { data } = await axios.get(`/reviews/${id}`, { signal }); return Array.isArray(data) ? data : data.data || data.reviews || []; }, enabled: Boolean(property), retry: 1 });
  const { data: documents = [] } = useQuery({ queryKey: ['property-documents', id], queryFn: async ({ signal }) => { const { data } = await axios.get('/property-documents/public', { params: { property: id, limit: 30 }, signal }); return data.documents || data.data || []; }, enabled: Boolean(property), retry: 1 });
  const { data: history = [] } = useQuery({ queryKey: ['property-price-history', id], queryFn: async ({ signal }) => { const { data } = await axios.get(`/price-history/${id}`, { signal }); return Array.isArray(data) ? data : data.data || []; }, enabled: Boolean(property), retry: 1 });
  const { data: related = [] } = useQuery({ queryKey: ['related-properties', id, propertyType(property?.type)], queryFn: async ({ signal }) => { const { data } = await axios.get('/properties', { params: { type: propertyType(property.type), limit: 4 }, signal }); return (data.properties || []).filter(item => item._id !== id).slice(0, 3); }, enabled: Boolean(property), retry: 1 });
  useEffect(() => {
    setOrigin(window.location.origin);
    setSaved(false);
    setShowMap(false);
    try { const current = JSON.parse(localStorage.getItem('recentlyViewed') || '[]'); localStorage.setItem('recentlyViewed', JSON.stringify([id, ...(Array.isArray(current) ? current : []).filter(value => value !== id)].slice(0, 10))); } catch {}
  }, [id]);
  useEffect(() => {
    if (!user) { setSaved(false); return; }
    const controller = new AbortController();
    axios.get(`/saved-properties/check/${id}`, { signal: controller.signal }).then(({ data }) => setSaved(Boolean(data.saved ?? data.isSaved))).catch(() => {});
    return () => controller.abort();
  }, [id, user]);
  async function toggleSave() {
    if (!user) { router.push('/login'); return; }
    if (saving) return;
    setSaving(true);
    try { const { data } = await axios.post('/saved-properties', { propertyId: id }); setSaved(Boolean(data.saved)); queryClient.invalidateQueries({ queryKey: ['savedProperties'] }); toast.success(data.saved ? 'Property saved' : 'Property removed'); }
    catch (failure) { toast.error(failure.response?.data?.message || 'Could not update saved properties'); }
    finally { setSaving(false); }
  }
  async function openChat() {
    if (!user) { router.push('/login'); return; }
    if (!property.sellerId?._id || contacting) return;
    setContacting(true);
    try { const { data } = await axios.post('/chats', { propertyId: id, sellerId: property.sellerId._id }); router.push(`/chat?chat=${data._id}`); }
    catch (failure) { toast.error(failure.response?.data?.message || 'Could not start a conversation'); }
    finally { setContacting(false); }
  }
  async function submitReview(event) {
    event.preventDefault();
    if (!user) { router.push('/login'); return; }
    if (!comment.trim() || submitting) return;
    setSubmitting(true);
    try { await axios.post('/reviews', { propertyId: id, rating, comment: comment.trim() }); setComment(''); await queryClient.invalidateQueries({ queryKey: ['property-reviews', id] }); toast.success('Your review has been added'); }
    catch (failure) { toast.error(failure.response?.data?.message || 'Could not submit your review'); }
    finally { setSubmitting(false); }
  }
  if (isPending) return <main className="app-container space-y-6 pb-20 pt-28" aria-busy="true"><div className="h-10 w-2/3 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /><div className="h-[45vh] animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" /><p className="text-sm text-slate-500">Loading property details…</p></main>;
  if (isError || !property) return <main className="app-container flex min-h-[70vh] flex-col items-center justify-center gap-4 pt-20 text-center"><Info size={40} className="text-indigo-500" /><h1 className="text-2xl font-semibold">{error?.response?.status === 404 ? 'This property is no longer available.' : 'We couldn’t load this property.'}</h1><p className="text-sm text-slate-500">Explore other properties or try again.</p><div className="flex gap-3"><button onClick={() => refetch()} className="btn-secondary">Try again</button><Link href="/properties" className="btn-primary">Browse properties</Link></div></main>;
  const sale = isSale(property.purpose);
  const phone = contactPhone(property.contactNumber || property.sellerId?.phone);
  const propertyUrl = `${(process.env.NEXT_PUBLIC_URL || '').replace(/\/$/, '')}/properties/${id}`;
  const whatsapp = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(`Hi, I’m interested in ${property.title}. ${propertyUrl}`)}` : null;
  const average = reviews.length ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1) : null;
  const facts = [[BedDouble, property.bedrooms ? `${property.bedrooms} bedrooms` : 'Bedroom details pending'], [Bath, property.bathrooms ? `${property.bathrooms} bathrooms` : 'Bathroom details pending'], [Maximize, property.areaSqFt ? `${Number(property.areaSqFt).toLocaleString('en-IN')} sq ft` : 'Area on request'], [Sofa, property.furnishing?.replace(/-/g, ' ') || 'Furnishing on request']];
  return (
    <div className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <PropertySchema property={property} />
      <main className="app-container pb-40 pt-24 sm:pt-28 md:pb-20">
        <nav aria-label="Breadcrumb" className="mb-7 flex flex-wrap items-center gap-2 text-xs text-slate-500"><Link href="/" className="hover:text-indigo-600">Home</Link><ChevronRight size={12} /><Link href="/properties" className="hover:text-indigo-600">Properties</Link><ChevronRight size={12} /><span className="max-w-[220px] truncate text-slate-800 dark:text-slate-300">{property.title}</span></nav>
        <div className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div className="min-w-0"><div className="mb-3 flex flex-wrap items-center gap-2"><span className="rounded-md bg-indigo-50 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">{propertyType(property.type).replace(/[_-]/g, ' ')} · {sale ? 'For sale' : 'For rent'}</span>{property.isVerified && <span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><ShieldCheck size={15} /> Verified listing</span>}<span className="text-xs capitalize text-slate-400">{property.status}</span></div><h1 className="max-w-3xl break-words text-2xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">{property.title}</h1><p className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-500 dark:text-slate-400"><MapPin size={16} className="mt-1 shrink-0" />{locationLabel(property.location) || 'Location details available from the owner'}</p></div><div className="flex shrink-0 items-center gap-2"><button onClick={toggleSave} disabled={saving} aria-pressed={saved} className="btn-secondary flex min-h-11 items-center gap-2 !px-4 !py-2.5 text-sm"><Heart size={17} className={saved ? 'fill-rose-500 text-rose-500' : ''} />{saved ? 'Saved' : 'Save'}</button><ShareProperty propertyUrl={propertyUrl} /></div></div>
        <div className="overflow-hidden rounded-2xl sm:rounded-3xl"><PropertyDetailGallery images={property.images || (property.image ? [property.image] : [])} title={property.title} /></div>
        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
          <div className="min-w-0">
            <nav aria-label="Property sections" className="flex gap-6 overflow-x-auto border-b border-slate-200 text-sm font-medium dark:border-slate-800">{[['overview', 'Overview'], ['amenities', 'Amenities'], ['location', 'Location'], ['reviews', 'Reviews']].map(([anchor, label]) => <a key={anchor} href={`#${anchor}`} className="shrink-0 border-b-2 border-transparent py-4 text-slate-500 hover:border-indigo-500 hover:text-indigo-600">{label}</a>)}</nav>
            <Section id="overview" title="A little more about this place">
              <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">{facts.map(([Icon, label]) => <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900"><Icon size={20} className="mb-3 text-indigo-500" /><p className="text-xs font-medium capitalize leading-5 text-slate-600 dark:text-slate-300">{label}</p></div>)}</div>
              <p className="whitespace-pre-line break-words text-sm leading-8 text-slate-600 dark:text-slate-400">{property.description || 'Ask the owner for more information about this property.'}</p>
              <dl className="mt-7 grid grid-cols-2 gap-x-8 gap-y-5 text-sm">{[['Deposit', property.deposit != null ? formatMoney(property.deposit) : 'On request'], ['Listed by', property.postedBy || 'Owner'], ['Property type', propertyType(property.type).replace(/[_-]/g, ' ')], ['Availability', property.possession?.replace(/-/g, ' ') || property.status || 'Ask the owner'], ['Floor', property.floor != null ? `${property.floor}${property.totalFloors ? ` of ${property.totalFloors}` : ''}` : null], ['Facing', property.facing?.replace(/-/g, ' ')]].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt className="mb-1.5 text-xs text-slate-500">{label}</dt><dd className="font-medium capitalize">{value}</dd></div>)}</dl>
            </Section>
            <Section id="amenities" title="The things that make it home">{property.amenities?.length ? <ul className="grid grid-cols-2 gap-x-5 gap-y-4">{property.amenities.map((amenity, index) => <li key={`${amenity}-${index}`} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"><Check size={17} className="mt-0.5 shrink-0 text-indigo-500" /><span className="break-words">{amenity}</span></li>)}</ul> : <p className="text-sm text-slate-500">Ask the owner about the amenities available here.</p>}</Section>
            <Section id="location" title="Get to know the neighbourhood"><p className="mb-5 flex items-start gap-2 text-sm leading-6 text-slate-500"><MapPin size={17} className="mt-0.5 shrink-0" />{locationLabel(property.location)}</p>{Number.isFinite(property.location?.coordinates?.lat) && Number.isFinite(property.location?.coordinates?.lng) && (property.location.coordinates.lat !== 0 || property.location.coordinates.lng !== 0) ? showMap ? <PropertyMap properties={[property]} height="320px" zoom={14} /> : <button onClick={() => setShowMap(true)} className="flex h-40 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 text-sm font-semibold text-indigo-600 dark:border-indigo-900 dark:bg-indigo-950"><MapPin size={28} /> Show location on map</button> : <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-900">Exact map location has not been provided. Confirm the address when you schedule a visit.</p>}</Section>
            <Section id="reviews" title={average ? `${average} out of 5 · ${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}` : 'Experiences from the community'}>
              {reviewError ? <p role="alert" className="mb-6 text-sm text-slate-500">Reviews couldn’t be loaded. <button onClick={() => retryReviews()} className="font-semibold text-indigo-600">Try again</button></p> : reviews.length ? <div className="mb-8 grid gap-5 sm:grid-cols-2">{reviews.slice(0, 6).map(review => <article key={review._id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"><div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-950">{review.userId?.name?.[0] || 'U'}</span><div><h3 className="text-sm font-semibold">{review.userId?.name || 'Community member'}</h3><div className="mt-1 flex items-center gap-1 text-xs text-amber-500"><Star size={12} fill="currentColor" />{review.rating} / 5</div></div></div><p className="mt-4 break-words text-sm leading-7 text-slate-600 dark:text-slate-400">{review.comment}</p>{review.reply?.text && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs leading-6 dark:bg-slate-800"><strong>Owner reply:</strong> {review.reply.text}</p>}</article>)}</div> : <p className="mb-6 text-sm text-slate-500">Be the first to share your experience with this property.</p>}
              <form onSubmit={submitReview} className="rounded-2xl bg-slate-50 p-5 sm:p-6 dark:bg-slate-900"><h3 className="text-sm font-semibold">Share your experience</h3><div className="my-4 flex gap-1" role="group" aria-label="Rating">{[1, 2, 3, 4, 5].map(value => <button key={value} type="button" aria-label={`${value} stars`} aria-pressed={rating === value} onClick={() => setRating(value)} className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800"><Star size={23} className={value <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} /></button>)}</div><label className="sr-only" htmlFor="property-review">Your review</label><textarea id="property-review" value={comment} onChange={event => setComment(event.target.value)} required minLength={3} maxLength={2000} rows={3} placeholder="What would you like someone to know about this place?" className="input-field resize-y" /><button type="submit" disabled={submitting} className="btn-primary mt-4 flex items-center gap-2 text-sm">{submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}{user ? 'Submit review' : 'Sign in to review'}</button></form>
            </Section>
            {documents.length > 0 && <Section title="Documents shared by the owner"><div className="grid gap-3 sm:grid-cols-2">{documents.filter(document => /^https:\/\//.test(document.fileUrl || '')).map(document => <a key={document._id} href={document.fileUrl} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm hover:border-indigo-300 dark:border-slate-800"><FileText size={20} className="shrink-0 text-indigo-500" /><span className="min-w-0 flex-1 truncate">{document.title || document.type}</span><ArrowUpRight size={16} className="text-slate-400" /></a>)}</div></Section>}
            {history.length > 0 && <Section title="Price history"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-800"><tr><th className="py-3 font-medium">Date</th><th className="py-3 font-medium">Previous price</th><th className="py-3 font-medium">Updated price</th></tr></thead><tbody>{history.slice(0, 10).map(entry => <tr key={entry._id} className="border-b border-slate-100 dark:border-slate-800"><td className="py-4 text-xs text-slate-500">{new Date(entry.createdAt).toLocaleDateString('en-IN')}</td><td>{formatMoney(entry.oldPrice)}</td><td className="font-semibold">{formatMoney(entry.newPrice)}</td></tr>)}</tbody></table></div></Section>}
          </div>
          <aside className="min-w-0 lg:pt-2"><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-20px_rgba(15,23,42,0.2)] lg:sticky lg:top-24 dark:border-slate-800 dark:bg-slate-900"><p className="mb-2 text-xs font-medium text-slate-500">{sale ? 'Asking price' : 'Monthly rent'}</p><p className="text-3xl font-semibold tracking-tight">{formatMoney(property.price)}{!sale && <span className="ml-1 text-sm font-normal text-slate-400">/ month</span>}</p>{property.deposit != null && <p className="mt-2 text-xs text-slate-500">Security deposit: {formatMoney(property.deposit)}</p>}<div className="my-6 h-px bg-slate-100 dark:bg-slate-800" /><div className="mb-5 flex items-center gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-lg font-semibold text-indigo-600 dark:bg-indigo-950">{property.sellerId?.name?.[0] || 'O'}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{property.sellerId?.name || 'Property owner'}</p><p className="mt-1 text-xs capitalize text-slate-500">Listed by {property.postedBy || 'owner'}</p></div></div><div className="[&>button]:w-full [&>button]:justify-center"><ScheduleVisit propertyId={id} /></div><button onClick={openChat} disabled={contacting || !property.sellerId?._id} className="btn-secondary mt-3 flex min-h-12 w-full items-center justify-center gap-2 text-sm">{contacting ? <Loader2 size={17} className="animate-spin" /> : <MessageCircle size={17} />}Message owner</button>{phone && <div className="mt-3 grid grid-cols-2 gap-3"><a href={`tel:+${phone}`} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-50 text-xs font-semibold dark:bg-slate-800"><Phone size={15} /> Call owner</a><a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-50 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"><MessageCircle size={15} /> WhatsApp</a></div>}<p className="mt-5 text-center text-[11px] leading-5 text-slate-400">Visit the property and verify the details before making a payment.</p><div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800"><ReportProperty propertyId={id} /></div></div></aside>
        </div>
        {related.length > 0 && <section className="mt-12 border-t border-slate-200 pt-12 dark:border-slate-800"><div className="mb-7 flex flex-wrap items-center justify-between gap-4"><h2 className="section-heading">A few more places to consider</h2><Link href={`/search?type=${encodeURIComponent(propertyType(property.type))}`} className="flex items-center gap-2 text-sm font-semibold text-indigo-600">Explore more <ArrowUpRight size={17} /></Link></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map(item => <PropertyCard key={item._id} {...cardProperty(item)} />)}</div></section>}
      </main>
      <div className="fixed inset-x-0 bottom-[var(--bottom-nav-height)] z-40 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md md:bottom-0 lg:hidden dark:border-slate-800 dark:bg-slate-900/95"><div className="min-w-0"><p className="text-[10px] text-slate-500">{sale ? 'Asking price' : 'Monthly rent'}</p><p className="truncate text-lg font-semibold">{formatMoney(property.price)}</p></div><a href="#overview" className="sr-only">Property overview</a><button onClick={() => document.querySelector('aside')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="btn-primary flex min-h-11 items-center gap-2 !px-5 !py-2.5 text-sm">Contact owner <ArrowUpRight size={16} /></button></div>
      <Footer />
    </div>
  );
}
