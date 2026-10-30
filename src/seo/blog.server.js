import { cache } from 'react';
import { publicBlog, validBlogKey } from './blog-seo.js';
import { PROPERTY_SEO } from './seo.constants.js';
const api=(process.env.NEXT_PUBLIC_API_URL||'http://localhost:5000/api').replace(/\/$/,'');
async function read(endpoint) {
  try {
    const response=await fetch(api+endpoint,{cache:'no-store',signal:AbortSignal.timeout(PROPERTY_SEO.fetchTimeout),redirect:'error'});
    if ([400,404,410].includes(response.status)) return {state:'missing'};
    if (!response.ok) return {state:'error'};
    return {state:'ok',data:await response.json()};
  } catch { return {state:'error'}; }
}
export const getPublicBlog=cache(async key=>{
  if (!validBlogKey(key)) return {state:'missing',blog:null};
  const result=await read('/blogs/'+encodeURIComponent(key));
  if (result.state!=='ok') return {state:result.state,blog:null};
  const blog=publicBlog(result.data?.data);
  if (!blog || /^[a-f\d]{24}$/i.test(key) && String(blog._id).toLowerCase()!==key.toLowerCase()) return {state:'missing',blog:null};
  return {state:'ok',blog};
});
export const getPublicBlogs=cache(async()=>{
  const result=await read('/blogs?page=1&limit=20&summary=true');
  if(result.state!=='ok')return {state:'error',data:null};
  const items=result.data?.data, page=result.data?.page||1, pages=result.data?.pages||1;
  if(!Array.isArray(items)||items.length>20||items.some(item=>!publicBlog(item,true)))return {state:'error',data:null};
  return {state:'ok',data:{pages:[{items:items.map(item=>publicBlog(item,true)),nextPage:page<pages?page+1:undefined}],pageParams:[1]}};
});
