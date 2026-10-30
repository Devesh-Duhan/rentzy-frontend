import {test,expect,ready} from './fixtures/test';

test('public auth content and a single primary heading remain visible without JavaScript',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false,serviceWorkers:'block'});
 const page=await context.newPage();
 for(const route of ['/login','/register']){
  const response=await page.goto(baseURL+route);expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveCount(1);await expect(page.locator('h1')).toBeVisible();
  expect(await page.locator('h1').evaluate(el=>{let node:Element|null=el;while(node){if(getComputedStyle(node).opacity==='0')return false;node=node.parentElement;}return true;})).toBe(true);
  await expect(page.locator('input[type="email"]')).toBeVisible();
 }
 await context.close();
});

test('public mobile navigation does not prefetch guarded redirects or auth bundles',async({page,isMobile})=>{
 test.skip(!isMobile,'Guarded links are always visible in the mobile bottom bar.');
 const requests:string[]=[];page.on('request',request=>requests.push(request.url()));
 await page.goto('/');await ready(page,'.bottom-nav');await page.waitForTimeout(1800);
 expect(requests.filter(url=>/\/(?:profile|wishlist|add|become-seller|login|register)(?:\?|$)/.test(url))).toEqual([]);
 await page.locator('.bottom-nav').getByRole('link',{name:'Profile'}).click();
 await expect(page).toHaveURL(/\/login(?:\?|$)/);await expect(page.locator('input[type="email"]')).toBeVisible();
});

test('category lookup renders real metadata, reuses initial queries and rejects invalid/inactive paths',async({page,request})=>{
 for(const path of ['/category/no-such-category','/category/hidden','/featured-properties/invalid','/featured-properties/0','/featured-properties/10000']){
  for(const agent of ['Mozilla/5.0','Googlebot']){const response=await request.get(path,{headers:{'User-Agent':agent}});expect(response.status(),path).toBe(404);expect(await response.text()).not.toContain('PRIVATE_CATEGORY_MARKER');}
 }
 const alias=await request.get('/category/COMMERCIAL?sub=office',{maxRedirects:0});expect(alias.status()).toBe(308);expect(alias.headers().location).toBe('/category/commercial?sub=office');
 const api:string[]=[];page.on('request',r=>{if(r.url().includes('/api/categories/'))api.push(r.url());});
 await page.goto('/category/commercial');await expect(page.locator('h1')).toHaveText('Commercial');await expect(page).toHaveTitle('Commercial Properties | RentzyPro');
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://rentzypro.com/category/commercial');expect(api).toEqual([]);
 const filtered=await request.get('/category/commercial?sub=office');expect(await filtered.text()).toContain('content="noindex, follow"');
 const failure=await request.get('/category/unavailable');expect(failure.status()).toBe(200);expect(await failure.text()).toContain('content="noindex, follow"');expect(await failure.text()).toContain('Category Temporarily Unavailable');
 for(const path of ['/featured-properties','/featured-properties/1']){const response=await request.get(path);expect(response.status()).toBe(200);expect(await response.text()).toContain('content="noindex, follow"');}
});
