import test from 'node:test';
import assert from 'node:assert/strict';
import {staticEntries,locationEntries,dynamicEntries,indexEntries,renderSitemap,lastmod,xmlEscape} from '../src/seo/sitemap.utils.js';
import {CRAWL} from '../src/seo/crawl.constants.mjs';
const manifest={pageSize:5000,properties:{count:5001,pages:2},blogs:{count:1,pages:1},locations:[{city:'Hisar',purpose:'rent'}]};
test('index contains all pages, locations and independent static sitemap',()=>{
 const entries=indexEntries(manifest);assert.equal(entries.length,5);assert.ok(entries.some(e=>e.url.endsWith('/sitemap-properties-2.xml')));
 assert.match(renderSitemap(entries,true),/<sitemapindex xmlns=/);assert.throws(()=>indexEntries({...manifest,properties:{count:5001,pages:1}}));
});
test('static canonical pages exclude personal data, filters and callbacks but include public auth',()=>{
 const urls=staticEntries().map(e=>e.url);assert.ok(urls.includes('https://rentzypro.com/login'));assert.ok(urls.includes('https://rentzypro.com/register'));
 assert.ok(!urls.some(url=>/admin|seller|profile|reset-password|search|\?/.test(url)));
 assert.equal(new Set(urls).size,urls.length);
});
test('XML correctly escapes query parameters and removes duplicate URLs',()=>{
 const entries=locationEntries([{city:'Hisar',purpose:'rent'}]);const xml=renderSitemap([...entries,...entries]);
 assert.match(xml,/city=Hisar&amp;purpose=rent/);assert.equal((xml.match(/<loc>/g)||[]).length,1);
 assert.equal(xmlEscape('&<>"\x01'),'&amp;&lt;&gt;&quot;');
 assert.throws(()=>renderSitemap([{url:'https://evil.example/property'}]));assert.throws(()=>renderSitemap([{url:'https://rentzypro.com/#fragment'}]));
});
test('public IDs, slug fallback and trustworthy dates',()=>{
 const data={pageSize:5000,entries:[{id:'aaaaaaaaaaaaaaaaaaaaaaaa',slug:'guide',lastmod:'2026-01-01'},{id:'bbbbbbbbbbbbbbbbbbbbbbbb',slug:'<unsafe>',lastmod:'invalid'}]};
 const entries=dynamicEntries('blogs',data);assert.ok(entries[0].url.endsWith('/blog/guide'));assert.ok(entries[1].url.endsWith('/blog/bbbbbbbbbbbbbbbbbbbbbbbb'));
 assert.equal(lastmod('2999-01-01'),'');assert.equal(lastmod('invalid'),'');assert.match(renderSitemap(entries),/<lastmod>2026-01-01T00:00:00.000Z<\/lastmod>/);
 assert.throws(()=>dynamicEntries('properties',{...data,entries:[{id:'invalid'}]}));
 assert.throws(()=>dynamicEntries('properties',{...data,entries:Array(CRAWL.pageSize+1).fill(data.entries[0])}));
});
test('sitemap URL protocol limit enforced before serialization',()=>{
 assert.throws(()=>renderSitemap(Array(50001).fill({url:'https://rentzypro.com/'})),/limit/);
 assert.throws(()=>renderSitemap([{url:'https://rentzypro.com/'+ 'a'.repeat(2048)}]));
});

test('cached inventory fetch and failure responses never masquerade as valid empty XML',async()=>{
 const {readSitemap,sitemapResponse,sitemapError}=await import('../src/seo/sitemap.server.js');
 const original=globalThis.fetch;let options;
 try{
  globalThis.fetch=async(url,input)=>{options=input;return new Response(JSON.stringify({entries:[]}),{headers:{'Content-Type':'application/json'}});};
  assert.deepEqual(await readSitemap('/properties/1'),{entries:[]});assert.equal(options.next.revalidate,300);assert.equal(options.redirect,'error');
  globalThis.fetch=async()=>new Response('outage',{status:503});await assert.rejects(readSitemap(''));
 }finally{globalThis.fetch=original;}
 const failure=sitemapError();assert.equal(failure.status,503);assert.equal(failure.headers.get('Retry-After'),'300');assert.equal(failure.headers.get('Cache-Control'),'no-store');assert.equal(failure.headers.get('X-Robots-Tag'),'noindex');
 const success=sitemapResponse(staticEntries());assert.equal(success.status,200);assert.match(success.headers.get('Cache-Control'),/s-maxage=300/);assert.match(success.headers.get('Content-Type'),/application\/xml/);
});
