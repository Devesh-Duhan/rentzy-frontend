"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ArrowRight, BedDouble, Building2, ChevronLeft, ChevronRight, Home, LandPlot, Loader2, Store, Warehouse } from 'lucide-react';
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

function CategoryRow({ category: { value, title, icon: Icon } }) {
  const [sectionRef, visible] = useNearViewport();
  const rail = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage, isFetchNextPageError } = useInfiniteQuery({
    queryKey: ['home', 'category', value],
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => (await axios.get('/properties', { params: { type: value, page: pageParam, limit: 8 }, signal })).data,
    getNextPageParam: lastPage => lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
    enabled: visible,
    staleTime: 60000,
  });
  const properties = data?.pages.flatMap(page => page.properties || []) || [];
  const count = data?.pages[0]?.count || 0;
  const headingId = `category-${value}`;
  const railId = `${headingId}-properties`;

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
  }, [properties.length, isPending, hasNextPage]);

  function loadMore() { return fetchNextPage({ cancelRefetch: false }); }
  function scroll(direction) {
    const element = rail.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  function onScroll(event) {
    const element = event.currentTarget;
    if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError && element.scrollWidth - element.scrollLeft - element.clientWidth < element.clientWidth / 2) loadMore();
  }

  if (visible && !isPending && !isError && !properties.length) return null;

  return (
    <section ref={sectionRef} aria-labelledby={headingId} className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-white text-indigo-600 dark:border-indigo-900 dark:bg-slate-900"><Icon size={19} /></span>
          <div className="min-w-0"><h3 id={headingId} className="text-base font-semibold tracking-tight sm:text-lg">{title}</h3>{count > 0 && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{count} {count === 1 ? 'property' : 'properties'}</p>}</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <Link href={`/properties?type=${value}`} className="mr-1 inline-flex min-h-11 items-center gap-1.5 px-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 sm:text-sm dark:text-indigo-400">View all <ArrowRight size={14} /></Link>
          <button type="button" onClick={() => scroll(-1)} disabled={edges.start || isPending} aria-label={`Previous ${title.toLowerCase()}`} aria-controls={railId} className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-35 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><ChevronLeft size={18} /></button>
          <button type="button" onClick={() => scroll(1)} disabled={edges.end || isPending} aria-label={`Next ${title.toLowerCase()}`} aria-controls={railId} className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-35 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><ChevronRight size={18} /></button>
        </div>
      </div>
      {isError && !properties.length ? <div role="alert" className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500">We couldn&apos;t load {title.toLowerCase()}.</p><button type="button" onClick={() => refetch()} className="mt-3 text-sm font-semibold text-indigo-600">Try again</button></div> : (
        <ul ref={rail} id={railId} aria-labelledby={headingId} aria-busy={isPending || isFetchingNextPage} tabIndex={0} onScroll={onScroll} className={styles.rail}>
          {isPending ? Array.from({ length: 4 }, (_, index) => <li key={index} className={styles.item}><PropertySkeleton /></li>) : properties.map(property => <li key={property._id} className={styles.item}><PropertyCard {...cardProperty(property)} /></li>)}
          {hasNextPage && <li className={`${styles.item} flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-indigo-200 bg-white p-6 text-center dark:border-indigo-900 dark:bg-slate-900`}><div><Icon size={28} className="mx-auto mb-4 text-indigo-500" /><p className="mb-4 text-sm font-medium">{isFetchNextPageError ? 'More properties could not be loaded.' : 'Keep exploring this category'}</p><button type="button" onClick={loadMore} disabled={isFetchingNextPage} className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2 text-sm">{isFetchingNextPage ? <><Loader2 size={16} className="animate-spin" /> Loading...</> : <>{isFetchNextPageError ? 'Try again' : 'Load more'} <ArrowRight size={16} /></>}</button></div></li>}
        </ul>
      )}
    </section>
  );
}

export default function PropertyCategoryRows() {
  return (
    <div className="space-y-9 sm:space-y-12">
      {CATEGORIES.map(category => <CategoryRow key={category.value} category={category} />)}
      <div className="hidden flex-col items-center rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center only:flex dark:border-slate-700"><Home className="mb-4 text-indigo-500" size={36} /><h3 className="text-lg font-semibold">New spaces are on the way.</h3><p className="mt-2 text-sm text-slate-500">Be the first to list a property in your city.</p><Link href="/become-seller" className="btn-primary mt-6">List your property</Link></div>
    </div>
  );
}
