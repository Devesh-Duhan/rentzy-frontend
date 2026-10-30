"use client";

import Link from 'next/link';
import {BedDouble,Building2,Home,LandPlot,Store,Warehouse} from 'lucide-react';
import StaySearch from '@/components/StaySearch';
import PropertyCategoryRows from '@/components/PropertyCategoryRows';
import Footer from '@/components/Footer';

const types=[['All properties','',Home],['Apartments','apartment',Building2],['Independent homes','villa',Home],['Commercial','commercial',Store],['Rooms & PGs','pg_hostel',BedDouble],['Land & plots','land',LandPlot],['Industrial','industrial',Warehouse]];

export default function HomeClient({ failures = [] }){
 return <div className="market-home bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
   <main>
     <h1 className="sr-only">Find homes and properties on RentzyPro</h1>
     <section aria-label="Find a property" className="market-search-section"><StaySearch /></section>
     <nav aria-label="Property categories" className="market-types market-container">{types.map(([label,value,Icon])=><Link key={label} href={value?`/properties?type=${value}`:'/properties'} className={!value?'is-selected':''}><Icon size={24} strokeWidth={1.5}/><span>{label}</span></Link>)}</nav>
     <section aria-label="Explore properties" className="market-container pb-10 pt-5 sm:pb-14 sm:pt-8"><PropertyCategoryRows failures={failures} /></section>
   </main>
   <Footer />
 </div>;
}
