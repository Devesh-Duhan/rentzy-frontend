'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import axios from '@/lib/axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search, SlidersHorizontal, X, MapPin, ChevronDown, BedDouble, Maximize2, Home, Filter } from 'lucide-react';

const PropertyMap = dynamic(() => import('@/components/PropertyMap'), { ssr: false });

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'flat', label: 'Flat' },
  { value: 'room', label: 'Room' },
  { value: 'shop', label: 'Shop' },
  { value: 'office', label: 'Office' },
  { value: 'land', label: 'Land' },
  { value: 'pg_hostel', label: 'PG/Hostel' },
];

export default function MapSearchClient() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    type: '',
    purpose: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
  });

  const [appliedFilters, setAppliedFilters] = useState({});

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('limit', '200');
        Object.entries(appliedFilters).forEach(([k, v]) => {
          if (v) params.set(k, v);
        });
        const { data } = await axios.get(`/properties?${params.toString()}`);
        setProperties(data.properties || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [appliedFilters]);

  const applyFilters = () => {
    const applied = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null) applied[key] = value;
    });
    setAppliedFilters(applied);
    setMobileFiltersOpen(false);
  };

  const clearFilters = () => {
    setFilters({ type: '', purpose: '', minPrice: '', maxPrice: '', bedrooms: '' });
    setAppliedFilters({});
  };

  const activeFilterCount = Object.keys(appliedFilters).length;

  const FilterPanel = () => (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 block">Property Type</label>
        <div className="grid grid-cols-2 gap-2">
          {PROPERTY_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilters({ ...filters, type: filters.type === t.value ? '' : t.value })}
              className={`pill text-xs justify-center ${
                filters.type === t.value
                  ? 'active'
                  : ''
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 block">Purpose</label>
        <select
          value={filters.purpose}
          onChange={(e) => setFilters({ ...filters, purpose: e.target.value })}
          className="input-field"
        >
          <option value="">All</option>
          <option value="rent">For Rent</option>
          <option value="sell">For Sale</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 block">Min Price</label>
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            placeholder="₹ Min"
            className="input-field"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 block">Max Price</label>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            placeholder="₹ Max"
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 block">Bedrooms</label>
        <select
          value={filters.bedrooms}
          onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
          className="input-field"
        >
          <option value="">Any</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n} BHK</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={clearFilters}
          className="btn-secondary flex-1"
        >
          Clear
        </button>
        <button
          onClick={applyFilters}
          className="btn-primary flex-[2]"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col pt-28 lg:pt-[100px]">
        {/* Mobile filter bar */}
        <div className="lg:hidden px-4 py-3 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-indigo-600" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {properties.length} properties on map
            </span>
          </div>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="btn-ghost flex items-center gap-1.5 !px-4 !py-2 text-xs !font-semibold"
          >
            <SlidersHorizontal size={14} />
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
        </div>

        {/* Mobile filter bottom sheet */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] app-card rounded-t-[32px] shadow-2xl overflow-y-auto p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                  <Filter size={14} /> Filters
                </h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="btn-ghost !p-2">
                  <X size={18} />
                </button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        <div className="flex-1 flex">
          {/* Desktop filter sidebar */}
          <div className="hidden lg:flex w-80 shrink-0 flex-col p-6 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
              <MapPin size={20} className="text-indigo-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Map Search</h2>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{properties.length} properties</p>
              </div>
            </div>
            <FilterPanel />
          </div>

          {/* Map area */}
          <div className="flex-1 relative min-h-[400px] lg:min-h-0">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
              </div>
            ) : (
              <PropertyMap
                properties={properties}
                height="calc(100vh - 100px)"
                zoom={5}
              />
            )}
          </div>
        </div>

        {/* Mobile property cards below map */}
        <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="px-4 py-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-3">
              Properties ({properties.length})
            </h3>
            <div className="space-y-3 pb-6">
              {properties
                .filter(p => p.location?.coordinates?.lat && p.location?.coordinates?.lng)
                .map((property) => (
                  <Link
                    key={property._id}
                    href={`/properties/${property._id}`}
                    className="flex gap-3 p-3 app-card card-shadow active:scale-[0.98] transition-all"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                      <Image
                        src={property.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'}
                        alt={property.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{property.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1 mt-0.5">
                        <MapPin size={10} className="shrink-0" />
                        {property.location?.address || property.location?.city || ''}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs font-bold text-indigo-600">₹{property.price?.toLocaleString()}/mo</span>
                        {property.bedrooms && (
                          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5">
                            <BedDouble size={10} /> {property.bedrooms} BHK
                          </span>
                        )}
                        {property.areaSqFt && (
                          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5">
                            <Maximize2 size={10} /> {property.areaSqFt} sqft
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              {properties.filter(p => p.location?.coordinates?.lat && p.location?.coordinates?.lng).length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm font-medium">
                  No properties with location data found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
