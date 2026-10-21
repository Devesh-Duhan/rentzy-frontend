"use client";

import Image from 'next/image';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {useSelector} from 'react-redux';
import {useRouter} from 'next/navigation';
import {useQueryClient} from '@tanstack/react-query';
import {Heart,MapPin,BedDouble,Bath,Maximize,ArrowUpRight,ChevronLeft,ChevronRight,ImageIcon,BadgeCheck} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '@/lib/axios';
import {formatMoney,isSale,locationLabel,propertyType} from '@/lib/property';
import styles from './PropertyCard.module.css';

export default function PropertyCard({id,_id,title,location,price,images,image,type,purpose,bedrooms,bhk,bathrooms,areaSqFt,area,furnishing,isVerified,isNew,isSaved=false,layout='grid',compact=false}){
 const propertyId=id||_id,router=useRouter(),queryClient=useQueryClient();
 const {user}=useSelector(state=>state.auth);
 const [saved,setSaved]=useState(isSaved),[saving,setSaving]=useState(false),[index,setIndex]=useState(0),[brokenImage,setBrokenImage]=useState(false);
 const photos=[...new Set([...(Array.isArray(images)?images:[]),image].filter(Boolean))],src=photos[index]||photos[0];
 const numericPrice=typeof price==='number'?price:Number(String(price||'').replace(/[^\d.]/g,'')),sale=isSale(purpose);
 useEffect(()=>{setSaved(isSaved);},[isSaved,propertyId]);
 useEffect(()=>{setIndex(0);setBrokenImage(false);},[propertyId]);
 async function toggleSave(){
   if(!user){router.push('/login');return;}
   if(saving||!propertyId)return;
   setSaving(true);
   try{const{data}=await axios.post('/saved-properties',{propertyId});setSaved(Boolean(data.saved));queryClient.setQueryData(['saved-property-status',user._id,propertyId],{saved:Boolean(data.saved)});queryClient.invalidateQueries({queryKey:['savedProperties']});toast.success(data.saved?'Property saved':'Removed from saved properties');}
   catch(error){toast.error(error.response?.data?.message||'Could not update saved properties');}
   finally{setSaving(false);}
 }
 function slide(direction){setIndex(value=>(value+direction+photos.length)%photos.length);setBrokenImage(false);}
 return <article className={`${styles.card} ${compact?styles.compact:''} ${layout==='list'?styles.list:''}`}>
   <div className={styles.image}>
     <Link href={`/properties/${propertyId}`} aria-label={`View ${title||'property'}`} className={styles.photoLink}>{src&&!brokenImage?<Image src={src} alt={title||'Property photo'} fill sizes="(min-width: 1600px) 280px, (min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw" className="object-cover" unoptimized={!/^https:\/\/(res\.cloudinary\.com|images\.unsplash\.com|plus\.unsplash\.com)\//.test(src)} onError={()=>setBrokenImage(true)}/>:<div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400"><ImageIcon size={30}/><span className="text-xs">Photos coming soon</span></div>}</Link>
     <div className={styles.badges}>{isVerified?<span><BadgeCheck size={13}/> Verified</span>:<span>{sale?'For sale':'For rent'}</span>}{isNew&&<span>New</span>}</div>
     <button type="button" onClick={toggleSave} disabled={saving} aria-label={saved?'Remove from saved properties':'Save property'} aria-pressed={saved} className={styles.save}><Heart size={24} className={saved?'fill-rose-500 text-rose-500':''}/></button>
     {photos.length>1&&<><button type="button" onClick={()=>slide(-1)} aria-label="Previous property photo" className={`${styles.photoArrow} ${styles.previous}`}><ChevronLeft size={17}/></button><button type="button" onClick={()=>slide(1)} aria-label="Next property photo" className={`${styles.photoArrow} ${styles.next}`}><ChevronRight size={17}/></button><span className={styles.photoCount}>{index+1} / {photos.length}</span></>}
   </div>
   <div className={styles.body}>
     <p className={styles.category}>{propertyType(type).replace(/[_-]/g,' ')} · {sale?'For sale':'For rent'}</p>
     <h3><Link href={`/properties/${propertyId}`} className={styles.titleLink}>{title||'Untitled property'}</Link></h3>
     <p className={styles.location}><MapPin size={12}/><span>{locationLabel(location)||'Location not specified'}</span></p>
     <div className={styles.facts}>{(bedrooms??bhk)>0&&<span><BedDouble size={14}/>{bedrooms??bhk} beds</span>}{bathrooms>0&&<span><Bath size={13}/>{bathrooms} baths</span>}{(areaSqFt||area)>0&&<span><Maximize size={12}/>{areaSqFt||area} sq ft</span>}{!bedrooms&&!bhk&&!areaSqFt&&!area&&furnishing&&<span className="capitalize">{furnishing.replace(/-/g,' ')}</span>}</div>
     <div className={styles.price}><p><strong>{formatMoney(numericPrice)}</strong>{!sale&&<span> / month</span>}</p><Link href={`/properties/${propertyId}`} aria-label={`View details of ${title||'property'}`}><ArrowUpRight size={17}/></Link></div>
   </div>
 </article>;
}
