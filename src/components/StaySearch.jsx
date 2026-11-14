"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  ChevronDown,
  MapPin,
  Search,
  SlidersHorizontal,
  Wallet,
  KeyRound,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const PROPERTY_TYPES = [
  { value: '', label: 'Any property' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Independent home' },
  { value: 'room', label: 'Room' },
  { value: 'pg_hostel', label: 'PG / Hostel' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land / Plot' },
];

const PURPOSES = [
  { value: 'rent', label: 'Rent a home' },
  { value: 'sell', label: 'Buy a home' },
];

const BUDGETS = {
  rent: [10000, 20000, 35000, 50000, 100000],
  sell: [2500000, 5000000, 10000000, 20000000],
};

const formatINR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

/* Shared native <select> skin — guaranteed icon clearance via explicit left/right padding */
const selectCls =
  'peer w-full appearance-none cursor-pointer truncate rounded-lg border border-indigo-900/40 bg-[#161536] ' +
  '!pl-9 !pr-9 text-xs sm:text-[13px] text-slate-100 outline-none transition-colors ' +
  'hover:border-indigo-500/40 focus-visible:border-indigo-500 focus-visible:ring-1 focus-visible:ring-indigo-500/60';

function Field({ icon: Icon, label, children, className = '' }) {
  return (
    <label className={`group relative block min-w-0 ${className}`}>
      <span className="mb-1 block text-[11px] font-semibold leading-none tracking-tight text-white select-none">
        {label}
      </span>
      <span className="relative block">
        {Icon && (
          <Icon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-indigo-400 z-10" />
        )}
        {children}
      </span>
    </label>
  );
}

function Select({ value, onChange, label, options, className = '', style }) {
  return (
    <span className="relative block w-full">
      <select
        aria-label={label}
        value={value}
        onChange={onChange}
        className={`${selectCls} h-8 sm:h-9 ${className}`}
        style={{ paddingLeft: '2.35rem', paddingRight: '2.5rem', ...style }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#161536] text-white">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-indigo-400 z-10" />
    </span>
  );
}

export default function StaySearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState('');
  const [purpose, setPurpose] = useState('rent');
  const [type, setType] = useState('');
  const [budget, setBudget] = useState('');

  const budgetOptions = useMemo(
    () => [
      { value: '', label: 'Any budget' },
      ...BUDGETS[purpose].map((a) => ({ value: String(a), label: `Up to ${formatINR(a)}` })),
    ],
    [purpose]
  );

  const typeLabel = PROPERTY_TYPES.find((t) => t.value === type)?.label;

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams({ purpose });
    if (city.trim()) params.set('city', city.trim());
    if (type) params.set('type', type);
    if (budget) params.set('maxPrice', budget);
    setOpen(false);
    router.push(`/search?${params}`);
  };

  const clearAll = () => {
    setCity('');
    setType('');
    setPurpose('rent');
    setBudget('');
  };

  const onPurposeChange = (e) => {
    setPurpose(e.target.value);
    setBudget('');
  };

  const divider = <div className="my-auto h-7 w-px flex-shrink-0 bg-indigo-900/40" />;

  return (
    <div className="mx-auto w-full max-w-4xl px-3 sm:px-6">
      {/* ───────── Desktop / tablet bar ───────── */}
      <form
        onSubmit={handleSearch}
        aria-label="Search homes"
        className="stay-search-bar hidden md:flex items-center gap-1 rounded-full border border-indigo-500/30 bg-[#0c0a22]/95 p-1.5 shadow-[0_0_30px_rgba(79,70,229,0.18)] backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/50 hover:shadow-[0_0_35px_rgba(79,70,229,0.25)] focus-within:border-indigo-500/60"
      >
        <Field icon={MapPin} label="Where" className="flex-[1.3] px-3 py-0.5">
          <Input
            aria-label="City or neighbourhood"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search destinations"
            maxLength={100}
            className="h-8 lg:h-9 w-full rounded-lg border-indigo-900/40 bg-[#161536] !pl-9 pr-3 text-xs lg:text-[13px] text-slate-100 placeholder:text-slate-400 transition-colors focus-visible:border-indigo-500 focus-visible:ring-1 focus-visible:ring-indigo-500/60"
            style={{ paddingLeft: '2.35rem' }}
          />
        </Field>

        {divider}

        <Field icon={Building2} label="Property type" className="flex-1 px-3 py-0.5">
          <Select
            label="Property type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={PROPERTY_TYPES}
            className="lg:h-9"
          />
        </Field>

        {divider}

        <Field icon={KeyRound} label="Looking to" className="flex-1 px-3 py-0.5">
          <Select
            label="Listing purpose"
            value={purpose}
            onChange={onPurposeChange}
            options={PURPOSES}
            className="lg:h-9"
          />
        </Field>

        {divider}

        <Field icon={Wallet} label="Budget" className="flex-1 px-3 py-0.5">
          <Select
            label="Maximum budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            options={budgetOptions}
            className="lg:h-9"
          />
        </Field>

        <div className="flex-shrink-0 pl-1 pr-0.5">
          <Button
            type="submit"
            aria-label="Search properties"
            className="flex h-10 w-10 lg:h-11 lg:w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 p-0 text-white shadow-lg shadow-indigo-600/40 transition-all duration-200 hover:scale-105 hover:from-indigo-600 hover:to-purple-700 hover:shadow-indigo-600/60 active:scale-95"
          >
            <Search className="h-4 w-4 lg:h-[18px] lg:w-[18px] stroke-[2.2] text-white" />
            <span className="sr-only">Search properties</span>
          </Button>
        </div>
      </form>

      {/* ───────── Mobile pill ───────── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Start your search"
        className="stay-mobile-search md:hidden flex w-full items-center gap-2.5 rounded-full border border-indigo-500/30 bg-[#0c0a22]/95 p-1.5 text-left shadow-lg shadow-indigo-950/50 backdrop-blur-xl transition-all active:scale-[0.99]"
      >
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 shadow-md shadow-indigo-600/30">
          <Search className="h-4 w-4 stroke-[2.2] text-white" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold leading-tight text-white">Start your search</span>
          <span className="mt-0.5 block truncate text-[11px] text-slate-400">
            {city.trim() || 'Anywhere'} · {typeLabel && type ? typeLabel : 'Any property'} · {budget ? `Up to ${formatINR(budget)}` : 'Any budget'}
          </span>
        </span>
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-indigo-800/40 bg-[#161536] text-indigo-300">
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </span>
      </button>

      {/* ───────── Mobile dialog ───────── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          aria-label="Search homes"
          className="w-[calc(100%-1.5rem)] max-w-md overflow-hidden rounded-2xl border border-indigo-900/60 bg-[#0c0a22] p-0 text-white shadow-2xl backdrop-blur-2xl max-h-[92dvh] overflow-y-auto"
        >
          <DialogHeader className="border-b border-indigo-950/80 bg-gradient-to-b from-indigo-950/40 to-transparent px-4 pb-3 pt-4 text-left">
            <div className="mb-0.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
              <MapPin className="h-3 w-3" />
              <span>Your Next Move</span>
            </div>
            <DialogTitle className="text-lg font-bold tracking-tight text-white">Find your next home</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Choose where and how you want to live.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSearch} className="space-y-3 p-4">
            {/* Where */}
            <div className="rounded-xl border border-indigo-900/40 bg-[#161536]/80 p-2.5">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-indigo-300">Where</span>
              <span className="relative block">
                <MapPin className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-indigo-400 z-10" />
                <Input
                  aria-label="City or neighbourhood"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Hisar, Delhi"
                  maxLength={100}
                  className="h-9 w-full rounded-lg border-indigo-800/40 bg-[#0c0a22]/80 !pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:border-indigo-500 focus-visible:ring-1 focus-visible:ring-indigo-500/60"
                  style={{ paddingLeft: '2.35rem' }}
                />
              </span>
            </div>

            {/* Property type */}
            <div className="rounded-xl border border-indigo-900/40 bg-[#161536]/80 p-2.5">
              <Field icon={Building2} label="Property type">
                <Select
                  label="Property type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  options={PROPERTY_TYPES}
                  className="!bg-[#0c0a22]/80 !border-indigo-800/40 !h-9 text-sm"
                />
              </Field>
            </div>

            {/* Looking to */}
            <div className="rounded-xl border border-indigo-900/40 bg-[#161536]/80 p-2.5">
              <Field icon={KeyRound} label="Looking to">
                <Select
                  label="Listing purpose"
                  value={purpose}
                  onChange={onPurposeChange}
                  options={PURPOSES}
                  className="!bg-[#0c0a22]/80 !border-indigo-800/40 !h-9 text-sm"
                />
              </Field>
            </div>

            {/* Budget */}
            <div className="rounded-xl border border-indigo-900/40 bg-[#161536]/80 p-2.5">
              <Field icon={Wallet} label="Budget">
                <Select
                  label="Maximum budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  options={budgetOptions}
                  className="!bg-[#0c0a22]/80 !border-indigo-800/40 !h-9 text-sm"
                />
              </Field>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 border-t border-indigo-950/80 pt-3">
              <Button
                type="button"
                variant="ghost"
                onClick={clearAll}
                className="h-10 gap-1 rounded-xl px-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
              <Button
                type="submit"
                aria-label="Search properties"
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-600 hover:to-purple-700"
              >
                <Search className="h-4 w-4 text-white" />
                <span>Search properties</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}