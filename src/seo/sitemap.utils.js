import { SITE_SEO, PAGE_SEO } from './seo.constants.js';
import { CRAWL } from './crawl.constants.mjs';
const base = SITE_SEO.baseUrl;
const idPattern = /^[a-f\d]{24}$/i;
export const xmlEscape = value => String(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function lastmod(value) {
  if (!value || typeof value !== 'string') return '';
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.getTime() <= Date.now() ? date.toISOString() : '';
}
export function staticEntries() {
  return Object.values(PAGE_SEO).filter(p => p.sitemap !== false && p.robots?.index !== false).map(p => ({url: new URL(p.canonical, base).href}));
}
export function locationEntries(locations) {
  if (!Array.isArray(locations)) throw new Error('Invalid locations');
  return locations.map(item => {
    if (typeof item.city !== 'string' || !item.city.trim() || item.city.length > 100 || (item.purpose && !['rent','sell'].includes(item.purpose))) throw new Error('Invalid location');
    const url = new URL('/search', base);url.searchParams.set('city', item.city.trim());
    if (item.purpose) url.searchParams.set('purpose', item.purpose);
    return {url:url.href};
  });
}
export function dynamicEntries(kind, data) {
  if (!['properties','blogs'].includes(kind) || !Array.isArray(data.entries) || data.entries.length > CRAWL.pageSize || data.pageSize !== CRAWL.pageSize) throw new Error('Invalid sitemap page');
  return data.entries.map(item => {
    if (!idPattern.test(item.id)) throw new Error('Invalid public ID');
    const key = kind === 'blogs' && typeof item.slug === 'string' && /^[a-z\d_-]{1,200}$/i.test(item.slug) ? item.slug : item.id.toLowerCase();
    return {url:base + (kind === 'blogs' ? '/blog/' : '/properties/') + key, lastmod:lastmod(item.lastmod)};
  });
}
export function indexEntries(manifest) {
  if (manifest.pageSize !== CRAWL.pageSize) throw new Error('Invalid sitemap page size');
  const entries = [{url:base+'/sitemap-static.xml'}];
  if (locationEntries(manifest.locations).length) entries.push({url:base+'/sitemap-locations.xml'});
  for (const kind of ['properties','blogs']) {
    const info=manifest[kind];
    if (!info || !Number.isSafeInteger(info.count) || info.count < 0 || info.pages !== Math.ceil(info.count / CRAWL.pageSize) || info.pages > CRAWL.maxPages) throw new Error('Invalid sitemap count');
    for (let page=1;page<=info.pages;page++) entries.push({url:base+'/sitemap-'+kind+'-'+page+'.xml'});
  }
  return entries;
}
export function renderSitemap(entries, index=false) {
  if (entries.length > CRAWL.maxUrls) throw new Error('Sitemap URL limit exceeded');
  const unique=new Map();
  for (const item of entries) {
    const url=new URL(item.url);
    if (url.origin !== base || url.hash || url.username || url.password || item.url.length >= 2048) throw new Error('Invalid canonical sitemap URL');
    unique.set(item.url,item);
  }
  const root=index?'sitemapindex':'urlset', row=index?'sitemap':'url';
  const xml='<?xml version="1.0" encoding="UTF-8"?>\n<'+root+' xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+[...unique.values()].map(item=>'<'+row+'><loc>'+xmlEscape(item.url)+'</loc>'+(!index && lastmod(item.lastmod)?'<lastmod>'+lastmod(item.lastmod)+'</lastmod>':'')+'</'+row+'>').join('')+'</'+root+'>';
  if (new TextEncoder().encode(xml).length > 52428800) throw new Error('Sitemap byte limit exceeded');
  return xml;
}
