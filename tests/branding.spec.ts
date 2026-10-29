import fs from 'node:fs';
import {test,expect,ready,noOverflow} from './fixtures/test';
import {BRAND_ASSETS,BRAND_ICONS,WEB_APP_BRAND} from '../src/lib/brand';
import {SITE_SEO} from '../src/seo';

test('favicon is the original ICO, served directly with the right MIME; old URL still works',async({request})=>{
 const response=await request.get('/favicon.ico',{maxRedirects:0});
 expect(response.status()).toBe(200);expect(response.headers()['content-type']).toMatch(/^image\/(x-icon|vnd.microsoft.icon)/);
 expect((await response.body()).equals(fs.readFileSync('public/favicon.ico'))).toBe(true);
 const legacy=await request.get('/favicon',{maxRedirects:0});expect(legacy.status()).toBe(307);expect(legacy.headers().location).toMatch(/\/favicon.ico$/);
});
test('manifest is complete, every declared icon decodes at its real size, and legacy manifest redirects',async({request,page})=>{
 const response=await request.get('/manifest.webmanifest');expect(response.status()).toBe(200);expect(response.headers()['content-type']).toMatch(/application\/manifest\+json/);
 const manifest=await response.json();
 expect(manifest).toMatchObject({name:SITE_SEO.name,short_name:SITE_SEO.name,description:SITE_SEO.description,...WEB_APP_BRAND});
 expect(manifest.icons).toEqual(BRAND_ASSETS.manifestIcons);
 for(const icon of [...manifest.icons,{src:BRAND_ASSETS.appleTouchIcon,sizes:'180x180'},{src:BRAND_ASSETS.socialImage,sizes:'512x512'}]){
  const asset=await request.get(icon.src);expect(asset.status(),icon.src).toBe(200);expect(asset.headers()['content-type']).toMatch(/^image\/png/);
  const bytes=await asset.body();expect(`${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`).toBe(icon.sizes);
  await page.goto(icon.src);await expect.poll(()=>page.locator('img').evaluate(image=>(image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 }
 const legacy=await request.get('/site.webmanifest',{maxRedirects:0});expect(legacy.status()).toBe(308);expect(legacy.headers().location).toMatch(/\/manifest.webmanifest$/);
});
test('branding remains accessible and consistent on mobile/desktop, navigation, dark theme and reload',async({page})=>{
 const failures:string[]=[];page.on('response',response=>{if(response.status()>=400&&/\/(?:favicon|images\/.*(?:logo|icon|chrome))/.test(new URL(response.url()).pathname))failures.push(response.url());});
 await page.goto('/about');await ready(page,'a[href="/"]');
 const check=async()=>{
  await expect(page.locator('link[rel="icon"]')).toHaveCount(1);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href','/favicon.ico');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('sizes',BRAND_ICONS.icon.sizes);
  await expect(page.locator('link[rel="shortcut icon"]')).toHaveCount(0);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href',BRAND_ASSETS.appleTouchIcon);
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href',BRAND_ASSETS.manifest);
  await expect(page.locator('meta[name="theme-color"]')).toHaveCount(1);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content',WEB_APP_BRAND.theme_color);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content',`${SITE_SEO.baseUrl}${BRAND_ASSETS.socialImage}`);
  const logo=page.locator('header img[alt="RentzyPro logo"]:visible').first();
  await expect(logo).toBeVisible();await expect.poll(()=>logo.evaluate(image=>(image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  expect(await logo.getAttribute('src')).toContain('logo.');await noOverflow(page);
 };
 await check();await expect(page.locator('footer')).toContainText('RentzyPro');
 await page.locator('header a[href="/"]').first().click();await expect(page).toHaveURL('/');await check();
 await page.evaluate(()=>document.documentElement.classList.add('dark'));await check();
 await page.reload();await check();expect(failures).toEqual([]);
});

test('existing production worker refreshes stale brand bytes and retains offline icon support',async({browser,baseURL})=>{
 const context=await browser.newContext({serviceWorkers:'allow'});
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin===new URL(baseURL!).origin){await route.continue();return;}
  await route.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:url.pathname.endsWith('/categories')?'[]':'{}'});
 });
 try{
  const page=await context.newPage();await page.goto(`${baseURL}/about`);
  // Explicit registration also tests the existing worker when the dev app disables auto-registration.
  await page.evaluate(async()=>{await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready;});
  await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
  await page.evaluate(async()=>{
   const cache=await caches.open('rentzypro-v4-brand-assets');
   await cache.put('/favicon.ico',new Response('stale icon',{headers:{'Content-Type':'image/png'}}));
  });
  const readIcon=()=>page.evaluate(async()=>{const response=await fetch('/favicon.ico',{cache:'no-store'});return {type:response.headers.get('content-type'),bytes:Array.from(new Uint8Array(await response.arrayBuffer()).slice(0,4))};});
  expect((await readIcon()).bytes).toEqual([0,0,1,0]);
  await expect.poll(()=>page.evaluate(async()=>{const response=await caches.match('/favicon.ico');if(!response)return false;return new Uint8Array(await response.arrayBuffer())[0]===0;})).toBe(true);
  await context.setOffline(true);expect((await readIcon()).bytes).toEqual([0,0,1,0]);
 }finally{await context.close();}
});
