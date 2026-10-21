"use client";

import Link from 'next/link';
import {useQuery} from '@tanstack/react-query';
import {Globe,ArrowUpRight} from 'lucide-react';
import axios from '@/lib/axios';
import useNearViewport from '@/lib/useNearViewport';

const groups=[
 ['Support',[['Help centre','/help'],['Get help with a safety issue','/safety'],['Contact us','/contact'],['Refund policy','/refund-policy'],['Terms of service','/terms']]],
 ['Hosting',[['List your property','/become-seller'],['Seller dashboard','/seller'],['Hosting guidance','/help'],['Refer a friend','/refer'],['Responsible renting','/safety']]],
 ['RentzyPro',[['About us','/about'],['Property insights','/blog'],['Find a rental','/rent'],['Buy a home','/buy'],['Privacy policy','/privacy']]],
];
export default function Footer(){
 const [footerRef,visible]=useNearViewport();
 const {data:categories=[]}=useQuery({queryKey:['public','footer-categories'],queryFn:async()=>{const{data}=await axios.get('/categories');return(Array.isArray(data)?data:data?.data||data?.categories||[]).slice(0,6);},enabled:visible,staleTime:300000,gcTime:1800000});
 return <footer ref={footerRef} className="market-footer">
   <div className="market-container">
     <section className="border-b border-slate-200 py-9 dark:border-slate-800"><h2 className="mb-6 text-xl font-semibold tracking-tight">Find a place for your next chapter</h2><div className="grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">{(categories.length?categories:[{name:'Residential',slug:'residential'},{name:'Commercial',slug:'commercial'},{name:'Land & plots',slug:'land'}]).map(category=><Link key={category._id||category.slug||category.name} href={`/category/${category.slug||category.name.toLowerCase().replace(/\s+/g,'-')}`} className="text-sm hover:underline"><span className="block font-medium">{category.name}</span><span className="mt-1 block text-slate-500">Explore properties</span></Link>)}</div></section>
     <div className="grid gap-8 py-9 md:grid-cols-3">{groups.map(([title,links])=><section key={title} className="border-b border-slate-200 pb-7 last:border-0 md:border-0 md:pb-0 dark:border-slate-800"><h3 className="mb-4 text-sm font-semibold">{title}</h3><ul className="space-y-3">{links.map(([label,href])=><li key={href}><Link href={href} className="text-sm hover:underline">{label}</Link></li>)}</ul></section>)}</div>
     <div className="flex flex-col-reverse justify-between gap-5 border-t border-slate-200 py-6 text-sm md:flex-row md:items-center dark:border-slate-800"><div className="flex flex-wrap gap-x-3 gap-y-2"><span>© {new Date().getFullYear()} RentzyPro</span><span>·</span><Link href="/privacy" className="hover:underline">Privacy</Link><span>·</span><Link href="/terms" className="hover:underline">Terms</Link><span>·</span><Link href="/sitemap.xml" className="hover:underline">Sitemap</Link></div><div className="flex items-center gap-5 font-medium"><span className="inline-flex items-center gap-2"><Globe size={16}/> English (IN)</span><span>₹ INR</span><a href="https://www.instagram.com/rentzypro" target="_blank" rel="noopener noreferrer" aria-label="RentzyPro on Instagram"><span className="inline-flex items-center gap-1">Instagram <ArrowUpRight size={15}/></span></a></div></div>
   </div>
 </footer>;
}
