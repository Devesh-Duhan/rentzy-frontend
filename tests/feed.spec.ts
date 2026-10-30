import {test,expect} from './fixtures/test';
import {seoBlog} from './fixtures/seo-api.mjs';

test('RSS XML uses real dates and canonical links, escapes text and excludes drafts',async({request,page,api})=>{
 api.blogs=[{...seoBlog,featured:false,createdAt:'2026-01-01T00:00:00Z',title:'Rent & <b>Homes</b>'},{...seoBlog,_id:'dddddddddddddddddddddddd',slug:'draft',status:'draft',featured:false,createdAt:'2026-01-01T00:00:00Z',title:'PRIVATE_DRAFT'}];await api.syncBlogs();
 const response=await request.get('/feed.xml');expect(response.status()).toBe(200);expect(response.headers()['content-type']).toContain('application/rss+xml');
 const xml=await response.text();expect(xml).not.toContain('PRIVATE_DRAFT');expect(xml).not.toContain('lastBuildDate');expect(xml).toContain('<pubDate>Thu, 01 Jan 2026 00:00:00 GMT</pubDate>');
 const parsed=await page.evaluate(xml=>{const d=new DOMParser().parseFromString(xml,'application/xml');return {error:!!d.querySelector('parsererror'),title:d.querySelector('item title')?.textContent,link:d.querySelector('item link')?.textContent,count:d.querySelectorAll('item').length};},xml);
 expect(parsed).toEqual({error:false,title:'Rent & Homes',link:'https://rentzypro.com/blog/published-guide',count:1});
 expect(response.headers()['cache-control']).toBe('public, max-age=0, s-maxage=300');
});
test('RSS API failure is retryable 503 instead of a cached successful empty feed',async({request,api})=>{
 api.blogError=true;await api.syncBlogs();const failure=await request.get('/feed.xml');expect(failure.status()).toBe(503);expect(failure.headers()['cache-control']).toBe('no-store');expect(failure.headers()['retry-after']).toBe('300');expect(failure.headers()['x-robots-tag']).toBe('noindex');
 api.blogError=false;await api.syncBlogs();const empty=await request.get('/feed.xml');expect(empty.status()).toBe(200);expect(await empty.text()).not.toContain('<item>');
});
