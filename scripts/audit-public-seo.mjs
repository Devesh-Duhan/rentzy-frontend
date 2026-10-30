import fs from 'node:fs';
import { chromium } from 'playwright';
const base=process.env.AUDIT_BASE||'https://rentzypro.com';
const routes=['/','/rent','/properties','/buy','/sell','/about','/contact','/blog','/help','/privacy','/terms','/refund-policy','/safety','/featured-properties','/projects','/gallery','/rera','/tenant-screening','/mobile-app','/testimonials','/refer','/whatsapp','/login','/register','/feed.xml','/category/no-such-category','/featured-properties/invalid','/search?city=Hisar','/search?q=audit','/robots.txt','/sitemap.xml','/favicon.ico','/manifest.webmanifest','/missing-seo-audit-page','/properties/invalid','/admin','/seller','/profile'];
const browser=await chromium.launch({headless:true});const page=await browser.newPage();const results=[];
for(const path of routes){
 const start=performance.now();
 try{
  const res=await fetch(base+path,{redirect:'manual',signal:AbortSignal.timeout(20000)});const body=await res.text();
  const row={path,status:res.status,ms:Math.round(performance.now()-start),type:res.headers.get('content-type'),location:res.headers.get('location'),robotsHeader:res.headers.get('x-robots-tag'),cache:res.headers.get('cache-control'),bytes:Buffer.byteLength(body)};
  if(row.type?.includes('html'))Object.assign(row,await page.evaluate(html=>{const d=new DOMParser().parseFromString(html,'text/html');const meta=n=>[...d.querySelectorAll(`meta[name="${n}"],meta[property="${n}"]`)].map(e=>e.content);return {titles:[...d.querySelectorAll('title')].map(e=>e.textContent),description:meta('description'),canonical:[...d.querySelectorAll('link[rel="canonical"]')].map(e=>e.getAttribute('href')),robots:meta('robots'),ogTitle:meta('og:title'),ogImage:meta('og:image'),twitter:meta('twitter:card'),h1:[...d.querySelectorAll('h1')].map(e=>e.textContent),schema:[...d.querySelectorAll('script[type="application/ld+json"]')].map(e=>{try{return JSON.parse(e.textContent)['@type']||'graph';}catch{return 'INVALID';}}),imagesWithoutAlt:d.querySelectorAll('img:not([alt])').length,propertyLinks:d.querySelectorAll('a[href^="/properties/"]').length};},body));
  if(path==='/robots.txt'||path==='/sitemap.xml')row.body=body.slice(0,12000);
  if(path==='/manifest.webmanifest'){try{row.manifest=JSON.parse(body);}catch{row.invalidJSON=true;}}
  results.push(row);console.log(path,res.status,row.ms+'ms');
 }catch(e){results.push({path,error:e.message,ms:Math.round(performance.now()-start)});console.log(path,e.message);}
}
await browser.close();fs.writeFileSync(process.env.AUDIT_OUTPUT || 'seo-http-audit.json',JSON.stringify({at:new Date().toISOString(),base,results},null,2));
