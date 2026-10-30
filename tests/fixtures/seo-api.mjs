// Synthetic data. Invalid HTTP 200 records deliberately test frontend fail-closed handling.
import { properties, propertyResults } from './data.mjs';
export const seoPropertyId='999999999999999999999999';
const id=n=>String(n).repeat(24);
const sample={...properties[0],_id:seoPropertyId,type:['residential','house'],title:'Sunny &amp; <b>Home</b>',furnishing:'furnished',description:'A public rental house with natural light.',listingPayment:{signature:'PRIVATE_PAYMENT_MARKER'}};
const records=new Map(properties.map(p=>[p._id,p]));records.set(seoPropertyId,sample);
records.set(id(2),{...sample,_id:id(2),location:{},images:[],bedrooms:undefined,price:undefined,furnishing:undefined});
for(const [number,patch] of [[3,{isVerified:false}],[4,{rejectionReason:'Rejected'}],[5,{status:'rented'}],[6,{status:'sold'}]])records.set(id(number),{...sample,_id:id(number),title:'PRIVATE_PROPERTY_MARKER',...patch});
export const seoBlog={_id:'aaaaaaaaaaaaaaaaaaaaaaaa',slug:'published-guide',title:'Finding a rental home in Hisar',status:'published',content:'Compare the available homes and review the published property details.\n\nContact the owner after checking the rental information.',excerpt:'A practical guide to reviewing rental listings in Hisar.',categories:['Renting'],tags:['Hisar'],author:{name:'Test editor',email:'PRIVATE_AUTHOR_EMAIL'},coverImage:'/images/home-interior.jpg',publishDate:'2026-01-01T00:00:00Z',readingTime:2,views:0};
let testBlogs=null,testBlogError=false;
export function setBlogFixtures(blogs=null,error=false){testBlogs=blogs;testBlogError=error;}
export function seoApiResponse(url){
 if(url.pathname.startsWith('/api/blogs/')){
  const key=url.pathname.split('/').pop();
  if(key==='unavailable')return {status:503,body:{}};
  if(key==='private-draft')return {status:200,body:{data:{...seoBlog,status:'draft',title:'PRIVATE_BLOG_MARKER',content:'PRIVATE_BLOG_MARKER'}}};
  const blog=(testBlogs||[seoBlog]).find(item=>item.slug===key||item._id===key);
  return {status:blog?200:404,body:{data:blog}};
 }

 if(url.pathname==='/api/seo/sitemap')return {status:200,body:{pageSize:5000,properties:{count:5001,pages:2},blogs:{count:1,pages:1},locations:[{city:'Hisar'},{city:'Hisar',purpose:'rent'}]}};
 if(url.pathname.startsWith('/api/seo/sitemap/')){
  const [,kind,page]=url.pathname.match(/\/sitemap\/([^/]+)\/(\d+)$/)||[];
  return {status:200,body:{page:Number(page),pageSize:5000,entries:kind==='properties'&&page==='1'?[{id:seoPropertyId,lastmod:'2026-01-01T00:00:00Z'}]:kind==='properties'&&page==='2'?[{id:id(2)}]:kind==='blogs'&&page==='1'?[{id:'aaaaaaaaaaaaaaaaaaaaaaaa',slug:'published-guide',lastmod:'2026-01-01T00:00:00Z'}]:[]}};
 }

 if(url.pathname==='/api/settings')return {status:200,body:{}};
 if(url.pathname.startsWith('/api/categories/')){const slug=url.pathname.split('/').pop();if(slug==='unavailable')return {status:503,body:{}};if(slug==='hidden')return {status:200,body:{data:{name:'PRIVATE_CATEGORY_MARKER',slug:'hidden',isActive:false}}};return slug.toLowerCase()==='commercial'?{status:200,body:{data:{_id:'cccccccccccccccccccccccc',name:'Commercial',slug:'commercial',isActive:true,description:'Browse commercial listings.',sub:[]}}}:{status:404,body:{}};}
 if(url.pathname==='/api/categories')return {status:200,body:[]};
 if(url.pathname==='/api/blogs'){
  const rows=(testBlogs||[seoBlog]).filter(item=>item.status==='published');
  return {status:testBlogError?503:200,body:testBlogError?{}:{data:rows,count:rows.length,page:1,pages:1}};
 }
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
