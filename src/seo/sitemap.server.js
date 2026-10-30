import { CRAWL } from './crawl.constants.mjs';
import { renderSitemap } from './sitemap.utils.js';
const api = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/,'');
export async function readSitemap(endpoint) {
  const response=await fetch(api+'/seo/sitemap'+endpoint,{next:{revalidate:CRAWL.cacheSeconds},signal:AbortSignal.timeout(8000),redirect:'error'});
  if (!response.ok) throw new Error('Sitemap inventory unavailable');
  return response.json();
}
export function sitemapResponse(entries,index=false) {
  return new Response(renderSitemap(entries,index),{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=0, s-maxage='+CRAWL.cacheSeconds,'X-Content-Type-Options':'nosniff'}});
}
export function sitemapError(status=503) {
  return new Response(status===404?'Sitemap not found':'Sitemap temporarily unavailable',{status,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex',...(status===503?{'Retry-After':String(CRAWL.cacheSeconds)}:{})}});
}
