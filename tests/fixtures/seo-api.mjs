// Synthetic data. Invalid HTTP 200 records deliberately test frontend fail-closed handling.
import { properties, propertyResults } from './data.mjs';
export const seoPropertyId='999999999999999999999999';
const id=n=>String(n).repeat(24);
const sample={...properties[0],_id:seoPropertyId,type:['residential','house'],title:'Sunny &amp; <b>Home</b>',furnishing:'furnished',description:'A public rental house with natural light.',listingPayment:{signature:'PRIVATE_PAYMENT_MARKER'}};
const records=new Map(properties.map(p=>[p._id,p]));records.set(seoPropertyId,sample);
records.set(id(2),{...sample,_id:id(2),location:{},images:[],bedrooms:undefined,price:undefined,furnishing:undefined});
for(const [number,patch] of [[3,{isVerified:false}],[4,{rejectionReason:'Rejected'}],[5,{status:'rented'}],[6,{status:'sold'}]])records.set(id(number),{...sample,_id:id(number),title:'PRIVATE_PROPERTY_MARKER',...patch});
export function seoApiResponse(url){
 if(url.pathname==='/api/settings')return {status:200,body:{}};
 if(url.pathname==='/api/categories')return {status:200,body:[]};
 if(url.pathname==='/api/blogs')return {status:200,body:{data:[]}};
 if(url.pathname==='/api/properties'||url.pathname==='/api/search'){
  if(url.searchParams.get('city')==='Unavailable')return {status:503,body:{}};
  const params=new URLSearchParams(url.searchParams);if(url.pathname==='/api/search'&&!params.has('limit'))params.set('limit','12');
  if(params.get('q'))params.set('keyword',params.get('q'));
  const result=propertyResults(params);if(url.pathname==='/api/search'){const {properties:rows,...rest}=result;return {status:200,body:{...rest,data:rows}};}
  return {status:200,body:result};
 }
 if(url.pathname.startsWith('/api/properties/')){const key=url.pathname.split('/').pop();if(key===id(7))return {status:503,body:{}};const record=records.get(key);return {status:record?200:404,body:record||{message:'Property not found'}};}
 return {status:404,body:{message:'Unknown test API route'}};
}
