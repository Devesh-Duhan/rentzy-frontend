"use client";

import {useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {MapPin,Search,SlidersHorizontal,X} from 'lucide-react';

export default function StaySearch(){
 const router=useRouter(),dialog=useRef(null);
 const [open,setOpen]=useState(false);
 const [city,setCity]=useState(''),[purpose,setPurpose]=useState('rent'),[type,setType]=useState(''),[budget,setBudget]=useState('');
 useEffect(()=>{
   if(!open||!dialog.current)return;
   const body=document.body,root=document.documentElement,focus=document.activeElement,element=dialog.current;
   const {scrollX,scrollY}=window;
   const bodyStyles=Object.fromEntries(['position','top','left','width','overflowX','overflowY'].map(key=>[key,body.style[key]]));
   const rootStyles={overflowX:root.style.overflowX,overflowY:root.style.overflowY};
   element.showModal();
   Object.assign(body.style,{position:'fixed',top:-scrollY+'px',left:-scrollX+'px',width:'100%',overflow:'hidden'});
   root.style.overflow='hidden';
   return()=>{
     if(element.open)element.close();
     Object.assign(body.style,bodyStyles);Object.assign(root.style,rootStyles);
     focus?.focus({preventScroll:true});
     window.scrollTo({left:scrollX,top:scrollY,behavior:'instant'});
   };
 },[open]);
 function search(event){
   event.preventDefault();
   const params=new URLSearchParams({purpose});
   if(city.trim())params.set('city',city.trim());
   if(type)params.set('type',type);
   if(budget)params.set('maxPrice',budget);
   setOpen(false);router.push(`/search?${params}`);
 }
 function fields(){return <>
   <label className="stay-search-location"><span>Where</span><input aria-label="City or neighbourhood" value={city} onChange={event=>setCity(event.target.value)} placeholder="Search destinations" maxLength={100}/></label>
   <label><span>Property type</span><select aria-label="Property type" value={type} onChange={event=>setType(event.target.value)}><option value="">Any property</option><option value="apartment">Apartment</option><option value="villa">Independent home</option><option value="room">Room</option><option value="pg_hostel">PG / Hostel</option><option value="commercial">Commercial</option><option value="land">Land / Plot</option></select></label>
   <label><span>Looking to</span><select aria-label="Listing purpose" value={purpose} onChange={event=>{setPurpose(event.target.value);setBudget('');}}><option value="rent">Rent a home</option><option value="sell">Buy a home</option></select></label>
   <label><span>Budget</span><select aria-label="Maximum budget" value={budget} onChange={event=>setBudget(event.target.value)}><option value="">Any budget</option>{(purpose==='rent'?[10000,20000,35000,50000,100000]:[2500000,5000000,10000000,20000000]).map(amount=><option key={amount} value={amount}>Up to ₹{amount.toLocaleString('en-IN')}</option>)}</select></label>
   <button type="submit" className="stay-search-submit" aria-label="Search properties"><Search size={22}/><span>Search</span></button>
 </>;}
 return <div className="mx-auto max-w-[940px] px-4 sm:px-6">
   <form onSubmit={search} className="stay-search-bar hidden md:flex" aria-label="Search homes">{fields()}</form>
   <button type="button" onClick={()=>setOpen(true)} className="stay-mobile-search md:hidden"><Search size={21}/><span><strong>Start your search</strong><small>Anywhere · Any property · Any budget</small></span><SlidersHorizontal size={18}/></button>
   {open&&<dialog ref={dialog} aria-label="Search homes" onCancel={()=>setOpen(false)} onClick={event=>{if(event.target===event.currentTarget)setOpen(false);}} className="stay-search-dialog overscroll-contain overflow-y-auto"><div className="mb-7 flex items-center gap-4"><button type="button" onClick={()=>setOpen(false)} aria-label="Close search" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700"><X size={19}/></button><h2 className="text-xl font-semibold">Where would you like to live?</h2></div><div className="mb-5 flex items-center gap-2 text-sm text-slate-500"><MapPin size={17}/> Find a place that suits you</div><form onSubmit={search} className="stay-search-form">{fields()}</form></dialog>}
 </div>;
}
