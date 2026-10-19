"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, MapPin, Search, SlidersHorizontal, Check, Home } from 'lucide-react';

const CITIES = ['Hisar', 'Gurugram', 'Delhi', 'Bengaluru'];

export default function HeroSlider() {
  const router = useRouter();
  const [purpose, setPurpose] = useState('rent');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [budget, setBudget] = useState('');
  function search(event) {
    event.preventDefault();
    const params = new URLSearchParams({ purpose });
    if (city.trim()) params.set('city', city.trim());
    if (type) params.set('type', type);
    if (budget) params.set('maxPrice', budget);
    router.push(`/search?${params}`);
  }
  return (
    <section className="relative overflow-hidden bg-[#f4f5fb] dark:bg-slate-950">
      <div className="app-container grid gap-10 pb-12 pt-12 sm:pb-16 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-20">
        <div className="relative z-10 flex min-w-0 flex-col sm:block">
          <span className="mb-6 inline-flex self-start items-center gap-2 rounded-full border border-indigo-100 bg-white px-3.5 py-2 text-xs font-semibold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> A better way to find your place</span>
          <h1 className="hidden sm:block order-1 mt-8 max-w-xl text-[2.75rem] font-semibold leading-[1.08] tracking-[-0.05em] text-slate-950 sm:order-none sm:mt-0 sm:text-6xl xl:text-7xl dark:text-white">Find a place.<br /><span className="text-indigo-600 dark:text-indigo-400">Make it home.</span></h1>
          <p className="hidden sm:block order-2 mb-0 mt-6 max-w-md text-base leading-7 text-slate-600 sm:order-none sm:mb-8 sm:text-lg dark:text-slate-400">Your next chapter starts with the right space. Explore homes, compare the details, and connect directly with owners.</p>
          <form onSubmit={search} className="relative rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_16px_50px_-20px_rgba(49,46,129,0.2)] sm:p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex gap-1 border-b border-slate-100 pb-3 dark:border-slate-800" role="group" aria-label="Listing purpose">
              {[['rent', 'Rent a home'], ['sell', 'Buy a home']].map(([value, label]) => <button key={value} type="button" aria-pressed={purpose === value} onClick={() => setPurpose(value)} className={`min-h-10 rounded-lg px-4 text-sm font-semibold transition-colors ${purpose === value ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{label}</button>)}
            </div>
            <label className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 px-3 dark:bg-slate-800"><MapPin size={19} className="shrink-0 text-indigo-500" /><span className="sr-only">City or neighbourhood</span><input value={city} onChange={event => setCity(event.target.value)} placeholder="Enter a city or neighbourhood" className="min-h-12 w-full min-w-0 bg-transparent text-sm outline-none dark:text-white" maxLength={100} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label><span className="sr-only">Property type</span><select value={type} onChange={event => setType(event.target.value)} className="input-field h-12 !px-3"><option value="">Property type</option><option value="apartment">Apartment</option><option value="villa">Villa</option><option value="room">Room</option><option value="pg_hostel">PG / Hostel</option><option value="office">Office</option><option value="shop">Shop</option></select></label>
              <label><span className="sr-only">Maximum budget</span><select value={budget} onChange={event => setBudget(event.target.value)} className="input-field h-12 !px-3"><option value="">Any budget</option>{(purpose === 'rent' ? [10000, 20000, 35000, 50000, 100000] : [2500000, 5000000, 10000000, 20000000]).map(value => <option key={value} value={value}>Up to ₹{value.toLocaleString('en-IN')}</option>)}</select></label>
            </div>
            <button type="submit" className="btn-primary mt-3 flex min-h-12 w-full items-center justify-center gap-2"><Search size={18} /> Find my place <ArrowUpRight size={18} className="ml-auto" /></button>
          </form>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400"><span className="font-semibold">Popular cities</span>{CITIES.map(value => <button key={value} onClick={() => router.push(`/search?city=${encodeURIComponent(value)}&purpose=${purpose}`)} className="underline-offset-4 hover:text-indigo-600 hover:underline">{value}</button>)}</div>
        </div>
        <div className="relative mx-auto hidden w-full max-w-xl lg:block">
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full border border-indigo-200 dark:border-indigo-900" />
          <div className="relative aspect-[0.91] overflow-hidden rounded-[2rem] bg-slate-200">
            <Image src="/images/home-interior.jpg" alt="Sunlit living room with warm natural materials" fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/75">Room for what matters</p><p className="max-w-sm text-3xl font-medium leading-tight tracking-tight">A space that feels<br />like you.</p></div>
          </div>
          <div className="absolute -left-7 top-8 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-950/5 dark:border-slate-700 dark:bg-slate-900"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950"><Check size={22} /></span><div><p className="text-sm font-semibold dark:text-white">Your search, simplified.</p><p className="mt-0.5 text-xs text-slate-500">Details that help you decide</p></div></div>
          <div className="absolute -bottom-5 right-5 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-xl shadow-slate-950/5 dark:bg-slate-900"><Home size={24} className="text-indigo-600" /><div><p className="text-sm font-semibold dark:text-white">Less searching. More living.</p><p className="text-xs text-slate-500">Find your next home with RentzyPro</p></div></div>
        </div>
      </div>
    </section>
  );
}
