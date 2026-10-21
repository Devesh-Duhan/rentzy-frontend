"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BedDouble, Building2, ChevronLeft, ChevronRight, Home, LandPlot, Store, Warehouse } from 'lucide-react';
import axios from '@/lib/axios';
import { cardProperty } from '@/lib/property';
import useNearViewport from '@/lib/useNearViewport';
import PropertyCard from './PropertyCard';
import PropertySkeleton from './PropertySkeleton';
import styles from './PropertyCategoryRows.module.css';

const CATEGORIES = [
  { value: 'commercial', title: 'Commercial properties', icon: Store },
  { value: 'residential', title: 'Residential properties', icon: Building2 },
  { value: 'pg_hostel', title: 'PGs & hostels', icon: BedDouble },
  { value: 'land', title: 'Land & plots', icon: LandPlot },
  { value: 'industrial', title: 'Industrial spaces', icon: Warehouse },
  { value: 'short_term', title: 'Short-term stays', icon: Home },
];
const PREVIEW_LIMIT = 10;

function CategoryRow({ category: { value, title, icon: Icon } }) {
  const [sectionRef, visible] = useNearViewport();
  const rail = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['home', 'category', value, PREVIEW_LIMIT],
    queryFn: async ({ signal }) => (await axios.get('/properties', { params: { type: value, page: 1, limit: PREVIEW_LIMIT }, signal })).data,
    enabled: visible,
    staleTime: 60000,
  });
  const properties = (data?.properties || []).slice(0, PREVIEW_LIMIT);
  const hasMore = (data?.count || 0) > properties.length;
  const headingId = `category-${value}`;
  const railId = `${headingId}-properties`;
  const categoryHref = `/properties?type=${value}`;

  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const update = () => {
      const start = element.scrollLeft < 2;
      const end = element.scrollWidth - element.clientWidth - element.scrollLeft < 2;
      setEdges(previous => previous.start === start && previous.end === end ? previous : { start, end });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener('scroll', update, { passive: true });
    return () => { observer.disconnect(); element.removeEventListener('scroll', update); };
  }, [properties.length, isPending, hasMore]);

  function scroll(direction) {
    const element = rail.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  if (visible && !isPending && !isError && !properties.length) return null;

  return (
    <section ref={sectionRef} aria-labelledby={headingId} className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
        <h3 id={headingId} className="min-w-0 text-base font-semibold tracking-tight sm:text-xl"><Link href={categoryHref} className="inline-flex items-center gap-2 hover:text-indigo-600">{title}<ArrowRight size={18} className="shrink-0" /></Link></h3>
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <button type="button" onClick={() => scroll(-1)} disabled={edges.start || isPending} aria-label={`Previous ${title.toLowerCase()}`} aria-controls={railId} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-35 dark:bg-slate-800 dark:text-slate-200"><ChevronLeft size={18} /></button>
          <button type="button" onClick={() => scroll(1)} disabled={edges.end || isPending} aria-label={`Next ${title.toLowerCase()}`} aria-controls={railId} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-35 dark:bg-slate-800 dark:text-slate-200"><ChevronRight size={18} /></button>
        </div>
      </div>
      {isError ? <div role="alert" className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800"><p className="text-sm text-slate-500">We couldn&apos;t load {title.toLowerCase()}.</p><button type="button" onClick={() => refetch()} className="mt-3 text-sm font-semibold text-indigo-600">Try again</button></div> : (
        <ul ref={rail} id={railId} aria-labelledby={headingId} aria-busy={isPending} tabIndex={0} className={styles.rail}>
          {isPending ? Array.from({ length: 6 }, (_, index) => <li key={index} className={styles.item}><PropertySkeleton /></li>) : properties.map(property => <li key={property._id} className={styles.item}><PropertyCard {...cardProperty(property)} compact /></li>)}
          {!isPending && hasMore && <li className={styles.item}><Link href={categoryHref} aria-label={`See more ${title.toLowerCase()}`} className={styles.moreLink}><span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950"><Icon size={30} /></span><span className="inline-flex items-center gap-2 text-sm font-semibold sm:text-base">See more <ArrowRight size={18} /></span></Link></li>}
        </ul>
      )}
    </section>
  );
}

export default function PropertyCategoryRows() {
  return (
    <div className="space-y-7 sm:space-y-10">
      {CATEGORIES.map(category => <CategoryRow key={category.value} category={category} />)}
      <div className="hidden flex-col items-center rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center only:flex dark:border-slate-700"><Home className="mb-4 text-indigo-500" size={36} /><h3 className="text-lg font-semibold">New spaces are on the way.</h3><Link href="/become-seller" className="btn-primary mt-6">List your property</Link></div>
    </div>
  );
}
