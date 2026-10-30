import {test,expect,signIn} from './fixtures/test';
const base='https://rentzypro.com';
test('sitemap index and every shard return valid XML with canonical public URLs',async({request,page})=>{
 const response=await request.get('/sitemap.xml');expect(response.status()).toBe(200);expect(response.headers()['content-type']).toContain('application/xml');
 const parse=async(xml:string)=>page.evaluate(xml=>{const doc=new DOMParser().parseFromString(xml,'application/xml');return {error:!!doc.querySelector('parsererror'),root:doc.documentElement.localName,urls:[...doc.querySelectorAll('loc')].map(el=>el.textContent||'')};},xml);
 const index=await parse(await response.text());expect(index.error).toBe(false);expect(index.root).toBe('sitemapindex');expect(index.urls).toContain(base+'/sitemap-properties-2.xml');
 const urls:string[]=[];
 for(const url of index.urls){const result=await request.get(new URL(url).pathname);expect(result.status(),url).toBe(200);expect(result.headers()['content-type']).toContain('application/xml');const parsed=await parse(await result.text());expect(parsed.error).toBe(false);expect(parsed.root).toBe('urlset');expect(parsed.urls.length).toBeLessThanOrEqual(50000);urls.push(...parsed.urls);}
 expect(urls).toContain(base+'/properties/999999999999999999999999');expect(urls).toContain(base+'/blog/published-guide');expect(urls).toContain(base+'/search?city=Hisar&purpose=rent');
 expect(urls).toContain(base+'/login');expect(urls).toContain(base+'/register');expect(urls.length).toBe(new Set(urls).size);
 expect(urls.some(url=>/admin|seller|profile|private|draft|pending|localhost/.test(url))).toBe(false);
 expect((await request.get('/sitemap-properties-0.xml')).status()).toBe(404);
 expect((await request.get('/sitemaps/private/1.xml')).status()).toBe(404);
 expect((await request.get('/sitemap-properties-3.xml')).status()).toBe(404);
});
test('crawl controls keep public auth indexable, private redirects and panels noindex',async({request,context,baseURL})=>{
 const robots=await request.get('/robots.txt');expect(robots.status()).toBe(200);expect(robots.headers()['content-type']).toContain('text/plain');const text=await robots.text();expect(text).toContain('Sitemap: '+base+'/sitemap.xml');expect(text).toContain('Allow: /');expect(text).not.toMatch(/Disallow: \/(?:login|register|_next|images)/);
 for(const url of ['/login','/register','/properties']){const response=await request.get(url);expect(response.status()).toBe(200);expect(await response.text()).toContain('content="index, follow"');expect(response.headers()['x-robots-tag']||'').not.toContain('noindex');}
 const redirect=await request.get('/admin',{maxRedirects:0});expect([307,308]).toContain(redirect.status());expect(redirect.headers()['x-robots-tag']).toContain('noindex');
 await signIn(context,baseURL!,'admin');const panel=await context.request.get('/admin');expect(panel.status()).toBe(200);expect(panel.headers()['x-robots-tag']).toContain('noindex');expect(await panel.text()).toContain('content="noindex, nofollow"');
});
test('invalid, removed and unapproved property routes return actual 404 for browsers and bots',async({request})=>{
 for(const userAgent of ['Mozilla/5.0','Googlebot','Twitterbot/1.0'])for(const id of ['invalid','888888888888888888888888','333333333333333333333333']){const response=await request.get('/properties/'+id,{headers:{'User-Agent':userAgent}});expect(response.status(),userAgent+' '+id).toBe(404);expect(await response.text()).not.toContain('PRIVATE_PROPERTY_MARKER');}
});
test('canonical host, HTTPS, slash and existing manifest redirects preserve real assets',async({request})=>{
 const canonicalHeaders: Record<string,string>[]=[{Host:'www.rentzypro.com'},{Host:'rentzypro.com','x-forwarded-proto':'http'}];
 for(const headers of canonicalHeaders){const result=await request.get('/about?utm_source=test',{headers,maxRedirects:0});expect(result.status()).toBe(308);expect(result.headers().location).toBe(base+'/about?utm_source=test');}
 const slash=await request.get('/properties/',{maxRedirects:0});expect(slash.status()).toBe(308);expect(slash.headers().location).toBe('/properties');
 for(const [url,type]of [['/favicon.ico','image/'],['/manifest.webmanifest','application/manifest+json'],['/images/logo.png','image/']]){const result=await request.get(url);expect(result.status()).toBe(200);expect(result.headers()['content-type']).toContain(type);}
 const legacy=await request.get('/site.webmanifest',{maxRedirects:0});expect(legacy.status()).toBe(308);expect(legacy.headers().location).toBe('/manifest.webmanifest');
});
