"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ArrowUpRight, Building2, Home, MapPin, KeyRound, Search, MessageCircle, ShieldCheck, SlidersHorizontal, Store, BedDouble } from 'lucide-react';
import HeroSlider from '@/components/HeroSlider';
import PropertyCard from '@/components/PropertyCard';
import PropertySkeleton from '@/components/PropertySkeleton';
import Footer from '@/components/Footer';
import axios from '@/lib/axios';
import { cardProperty } from '@/lib/property';

const TYPES = [
  { name: 'Apartments', value: 'apartment', icon: Building2, text: 'A place in the heart of it all' },
  { name: 'Independent homes', value: 'villa', icon: Home, text: 'More space to call your own' },
  { name: 'Rooms & PGs', value: 'pg_hostel', icon: BedDouble, text: 'Easy living, new connections' },
  { name: 'Commercial spaces', value: 'commercial', icon: Store, text: 'Room for your next big idea' },
];
const STEPS = [
  { icon: Search, title: 'Find your favourites', text: 'Choose your city, budget and must-haves. Save the places you want to explore.' },
  { icon: MessageCircle, title: 'Meet the owner', text: 'Ask a question, get the details and schedule a visit that works for you.' },
  { icon: KeyRound, title: 'Start your next chapter', text: 'See the space in person, discuss the terms and make your move with confidence.' },
];

export default function HomeClient() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['home', 'properties'],
    queryFn: async ({ signal }) => (await axios.get('/properties', { params: { limit: 12 }, signal })).data,
    staleTime: 60000,
    retry: 1,
  });
  const properties = data?.properties || [];
  const featured = properties.filter(property => property.featured);
  const listings = (featured.length >= 3 ? featured : properties).slice(0, 6);

  return (
    <div className="bg-white pt-[var(--header-height)] text-slate-900 dark:bg-slate-950 dark:text-white">
      <HeroSlider />
      <div className="border-y border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900/50">
        <div className="app-container grid grid-cols-1 gap-4 py-5 sm:grid-cols-3 sm:gap-8 sm:py-6">{[[MessageCircle, 'Connect directly with owners'], [SlidersHorizontal, 'Search around your lifestyle'], [ShieldCheck, 'Clear details, informed choices']].map(([Icon, text]) => <div key={text} className="flex items-center justify-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300"><Icon size={19} className="shrink-0 text-indigo-500" />{text}</div>)}</div>
      </div>
      <section className="app-container py-14 sm:py-20" aria-labelledby="explore-title">
        <div className="mb-8 flex items-end justify-between gap-4"><div><p className="eyebrow">Different spaces. Same feeling.</p><h2 id="explore-title" className="section-heading">What does home look like to you?</h2></div><Link href="/search" className="hidden items-center gap-2 text-sm font-semibold text-indigo-600 sm:inline-flex">Explore all <ArrowRight size={17} /></Link></div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-5">{TYPES.map(({ name, value, icon: Icon, text }) => <Link key={value} href={`/search?type=${value}`} className="group rounded-2xl border border-slate-200 bg-[#fafafe] p-5 transition-colors hover:border-indigo-300 hover:bg-indigo-50 sm:p-6 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"><div className="mb-6 flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-100 bg-white text-indigo-600 dark:border-indigo-900 dark:bg-indigo-950"><Icon size={23} /></span><ArrowUpRight size={18} className="text-slate-300 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-600" /></div><h3 className="text-sm font-semibold sm:text-base">{name}</h3><p className="mt-2 hidden text-sm leading-6 text-slate-500 sm:block dark:text-slate-400">{text}</p></Link>)}</div>
      </section>
      <section className="bg-[#f8f9fc] py-14 sm:py-20 dark:bg-slate-900/40" aria-labelledby="listings-title">
        <div className="app-container">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Your next place could be right here</p><h2 id="listings-title" className="section-heading">{featured.length >= 3 ? 'Homes worth a closer look' : 'Fresh places. New possibilities.'}</h2><p className="mt-3 text-sm text-slate-500 sm:text-base dark:text-slate-400">Explore the latest spaces listed by our community.</p></div><Link href="/properties" className="btn-secondary flex items-center gap-2 !py-2.5 text-sm">View all properties <ArrowRight size={16} /></Link></div>
          {isPending ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <PropertySkeleton key={index} />)}</div> : isError ? <div role="alert" className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900"><p className="font-semibold">We couldn’t load the latest properties.</p><p className="mt-2 text-sm text-slate-500">Please try again in a moment.</p><button onClick={() => refetch()} className="btn-primary mt-5">Try again</button></div> : listings.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{listings.map(property => <PropertyCard key={property._id} {...cardProperty(property)} />)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700"><Home className="mx-auto mb-4 text-indigo-500" size={36} /><h3 className="text-lg font-semibold">New homes are on the way.</h3><p className="mt-2 text-sm text-slate-500">Be the first to list a space or explore another city.</p><Link href="/become-seller" className="btn-primary mt-6 inline-block">List your property</Link></div>}
        </div>
      </section>
      <section className="app-container py-16 sm:py-24" aria-labelledby="how-title">
        <div className="mx-auto mb-12 max-w-xl text-center"><p className="eyebrow">A little less complicated</p><h2 id="how-title" className="section-heading">From your first search<br className="hidden sm:block" /> to your first day home.</h2></div>
        <div className="grid gap-8 sm:grid-cols-3 sm:gap-12">{STEPS.map(({ icon: Icon, title, text }, index) => <div key={title} className="relative"><div className="mb-5 flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950"><Icon size={24} /></span><span className="text-xs font-semibold tracking-widest text-slate-400">0{index + 1}</span><span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" /></div><h3 className="text-lg font-semibold tracking-tight">{title}</h3><p className="mt-3 max-w-sm text-sm leading-7 text-slate-500 dark:text-slate-400">{text}</p></div>)}</div>
      </section>
      <section className="app-container pb-16 sm:pb-24">
        <div className="grid overflow-hidden rounded-3xl bg-[#171b35] md:grid-cols-[1.1fr_0.9fr]">
          <div className="p-7 sm:p-12 lg:p-14"><span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-100"><KeyRound size={13} /> For property owners</span><h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">Your property.<br />Someone’s perfect place.</h2><p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">Give your space the introduction it deserves. Create a listing, manage enquiries and connect with people looking for a place like yours.</p><Link href="/become-seller" className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-950 transition-colors hover:bg-indigo-50">List your property <ArrowUpRight size={18} /></Link></div>
          <div className="relative hidden min-h-[350px] md:block"><Image src="/images/owner-interior.jpg" alt="Calm, thoughtfully designed home interior" fill sizes="45vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-[#171b35] via-transparent to-transparent" /></div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
