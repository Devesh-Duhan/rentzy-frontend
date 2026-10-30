import {test,expect,ready,noOverflow} from './fixtures/test';
import {seoBlog} from './fixtures/seo-api.mjs';
import {propertyResults} from './fixtures/data.mjs';

test('raw HTTP contains real public content, links and unique native metadata',async({request,page})=>{
 const checks=[
  ['/', 'commercial property 1','https://rentzypro.com'],
  ['/rent','commercial property 1','https://rentzypro.com/rent'],
  ['/search?city=Hisar&purpose=rent','commercial property 1','https://rentzypro.com/search?city=Hisar&purpose=rent'],
  ['/properties/999999999999999999999999','A public rental house','https://rentzypro.com/properties/999999999999999999999999'],
  ['/blog',seoBlog.title,'https://rentzypro.com/blog'],
  ['/blog/published-guide',seoBlog.content.split('\n\n')[0],'https://rentzypro.com/blog/published-guide'],
 ];
 for(const [route,text,canonical] of checks){
  const response=await request.get(route);expect(response.status(),route).toBe(200);const html=await response.text();
  const parsed=await page.evaluate(html=>{const doc=new DOMParser().parseFromString(html,'text/html');doc.querySelectorAll('script').forEach(node=>node.remove());return {titles:doc.querySelectorAll('title').length,descriptions:doc.querySelectorAll('meta[name="description"]').length,canonicals:[...doc.querySelectorAll('link[rel="canonical"]')].map(node=>node.getAttribute('href')),main:doc.querySelector('main')?.textContent||'',heading:!!doc.querySelector('main h1'),links:doc.querySelectorAll('main a[href]').length,robots:doc.querySelector('meta[name="robots"]')?.getAttribute('content')};},html);
  expect(parsed.titles,route).toBe(1);expect(parsed.descriptions,route).toBe(1);expect(parsed.canonicals,route).toEqual([canonical]);expect(parsed.main,route).toContain(text);expect(parsed.heading,route).toBe(true);expect(parsed.links,route).toBeGreaterThan(0);expect(parsed.robots,route).toBe('index, follow');
  expect(html).not.toContain('PRIVATE_AUTHOR_EMAIL');expect(html).not.toContain('PRIVATE_PAYMENT_MARKER');
 }
});

test('public content is actually visible without JavaScript, not hidden streamed templates or opacity animations',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
 await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(baseURL!).origin?route.continue():route.fulfill({status:204,body:''}));
 const page=await context.newPage();
 for(const path of ['/','/rent','/search?city=Hisar&purpose=rent']){
  await page.goto(path);const card=page.locator('article').filter({has:page.getByRole('link',{name:'commercial property 1',exact:true})}).first();
  await expect(card).toBeVisible();expect(await card.evaluate(el=>{let node:Element|null=el;while(node){if(getComputedStyle(node).opacity==='0'||getComputedStyle(node).display==='none')return false;node=node.parentElement;}return true;})).toBe(true);
 }
 await page.goto('/blog/published-guide');await expect(page.getByRole('heading',{name:seoBlog.title,exact:true})).toBeVisible();await expect(page.getByText(seoBlog.content.split('\n\n')[0],{exact:true})).toBeVisible();
 await context.close();
});

test('home SSR seeds all bounded category queries and keeps property photo controls interactive',async({page,api})=>{
 const hydrationErrors:string[]=[];page.on('console',message=>{if(message.type()==='error'&&/hydrat|did not match/i.test(message.text()))hydrationErrors.push(message.text());});
 await page.goto('/');await expect(page.getByRole('heading',{name:'Commercial properties',exact:true})).toBeVisible();
 const card=page.locator('article').first();await ready(page,'article button');await card.hover();await card.getByRole('button',{name:'Next property photo'}).click();await expect(card.getByText('2 / 2',{exact:true})).toBeVisible();
 expect(api.calls.filter(call=>call.path==='/properties')).toHaveLength(0);expect(hydrationErrors).toEqual([]);await noOverflow(page);
});

test('article metadata and HTML share a lookup; hydration, refresh, internal navigation and history remain functional',async({page,request,api})=>{
 const counter=process.env.SEO_TEST_API_URL;
 const count=async()=>counter?(await(await request.get(counter+'/__seo/counts')).json())['/api/blogs/published-guide']||0:0;
 const before=await count();await page.goto('/blog/published-guide');await expect(page).toHaveTitle(seoBlog.title+' | RentzyPro');
 if(counter)expect((await count())-before).toBe(1);
 expect(api.calls.filter(call=>call.path==='/blogs/published-guide')).toHaveLength(0);
 await page.reload();await expect(page.getByRole('heading',{name:seoBlog.title,exact:true})).toBeVisible();
 await ready(page,'a[href="/blog"]');await page.getByRole('link',{name:'Back to All Articles',exact:true}).click();await expect(page).toHaveURL(/\/blog$/);await expect(page.getByRole('heading',{name:seoBlog.title,exact:true})).toBeVisible();
 await page.goBack();await expect(page).toHaveURL(/\/blog\/published-guide$/);await expect(page).toHaveTitle(seoBlog.title+' | RentzyPro');await noOverflow(page);
});

test('draft, removed and invalid articles are genuine 404s with no private content; aliases redirect permanently',async({request})=>{
 for(const path of ['/blog/private-draft','/blog/does-not-exist','/blog/invalid%20slug']){
  const response=await request.get(path);expect(response.status(),path).toBe(404);const html=await response.text();expect(html).not.toContain('PRIVATE_BLOG_MARKER');expect(html).toContain('content="noindex"');
 }
 const alias=await request.get('/blog/'+seoBlog._id,{maxRedirects:0});expect(alias.status()).toBe(308);expect(alias.headers().location).toBe('/blog/published-guide');
});

test('temporary article failure is noindex, keeps real retry UI and avoids duplicate initial requests',async({page,api})=>{
 await page.goto('/blog/unavailable');await expect(page).toHaveTitle('Article Temporarily Unavailable | RentzyPro');await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, follow');
 await expect(page.getByRole('heading',{name:'Could not load this article'})).toBeVisible();expect(api.calls.filter(call=>call.path==='/blogs/unavailable')).toHaveLength(0);
 await page.route(url=>url.pathname==='/api/blogs/unavailable',route=>route.fulfill({headers:{'Access-Control-Allow-Origin':'*'},contentType:'application/json',body:JSON.stringify({data:seoBlog})}));
 await page.getByRole('button',{name:'Try again',exact:true}).click();await expect(page.getByRole('heading',{name:seoBlog.title,exact:true})).toBeVisible();
});

test('bots and users get equivalent published article content and metadata',async({request})=>{
 const values=[];
 for(const agent of ['Mozilla/5.0','Googlebot','Twitterbot/1.0']){const response=await request.get('/blog/published-guide',{headers:{'User-Agent':agent}});expect(response.status()).toBe(200);const html=await response.text();expect(html).toContain(seoBlog.title);expect(html).toContain(seoBlog.content.split('\n\n')[0]);values.push(html.match(/<title>(.*?)<\/title>/)?.[1]);}
 expect(new Set(values).size).toBe(1);
});

test('failed location requests render a real error in raw HTML and recover with an explicit retry',async({request,page,api})=>{
 const response=await request.get('/search?city=Unavailable');const html=await response.text();expect(html).toContain('Search could not be loaded');expect(html).not.toContain('No properties found matching');
 await page.goto('/search?city=Unavailable');await expect(page.getByRole('heading',{name:'Search could not be loaded'})).toBeVisible();expect(api.calls.filter(call=>call.path==='/search')).toHaveLength(0);
 await page.route(url=>url.pathname==='/api/search',route=>{const result=propertyResults(new URLSearchParams('limit=12'));return route.fulfill({headers:{'Access-Control-Allow-Origin':'*'},contentType:'application/json',body:JSON.stringify({...result,data:result.properties})});});
 await page.getByRole('button',{name:'Try again',exact:true}).click();await expect(page.locator('article')).toHaveCount(12);
});
