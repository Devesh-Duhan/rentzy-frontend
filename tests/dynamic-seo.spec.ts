import { test, expect, ready } from './fixtures/test';
import { seoPropertyId as propertyId } from './fixtures/seo-api.mjs';
import { properties } from './fixtures/data.mjs';
const id=(n:number)=>String(n).repeat(24);

test('detail refresh and deep link use one shared request with actual metadata and server-rendered cards',async({page,request,api})=>{
 const counterURL=process.env.SEO_TEST_API_URL;
 const counts=async()=>counterURL ? await (await request.get(`${counterURL}/__seo/counts`)).json() : {};
 const before=await counts();
 await page.goto(`/properties/${propertyId}?utm_source=test`);
 await expect(page).toHaveTitle('2 BHK House for Rent in Hisar | RentzyPro');
 await expect(page.locator('meta[name="description"]')).toHaveAttribute('content',/₹18,500.*Furnished.*Haryana.*Sunny & Home/);
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',`https://rentzypro.com/properties/${propertyId}`);
 await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute('content','https://rentzypro.com/images/home-interior.jpg');
 const after=await counts();
 if(counterURL) expect((after[`/api/properties/${propertyId}`]||0)-(before[`/api/properties/${propertyId}`]||0)).toBe(1);
 expect(api.calls.filter(call=>call.path===`/properties/${propertyId}`)).toHaveLength(0);
 expect(await page.content()).not.toContain('PRIVATE_PAYMENT_MARKER');
 await page.reload();await expect(page).toHaveTitle('2 BHK House for Rent in Hisar | RentzyPro');
});

test('missing attributes use honest fallbacks',async({page})=>{
 await page.goto(`/properties/${id(2)}`);
 await expect(page).toHaveTitle('House for Rent | RentzyPro');
 await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content','https://rentzypro.com/images/android-chrome-512x512.png');
 await expect(page.locator('meta[name="description"]')).not.toHaveAttribute('content',/Hisar|Haryana|₹18,500|Furnished/);
});

test('unapproved, rejected, inactive, removed and invalid records never leak and are noindex',async({request})=>{
 for(const value of [id(3),id(4),id(5),id(6),id(8),'invalid']) {
  const response=await request.get(`/properties/${value}`,{headers:{'User-Agent':'Twitterbot/1.0'}});
  expect(response.status(),value).toBe(404);
  const html=await response.text();expect(html).toContain('content="noindex"');
  expect(html).not.toContain('PRIVATE_PROPERTY_MARKER');expect(html).not.toContain('PRIVATE_PAYMENT_MARKER');
 }
});

test('temporary API failure is noindex, never a fake listing and has an explicit retry',async({page,api})=>{
 let retries=0;
 await page.route(url=>url.pathname===`/api/properties/${id(7)}`,async route=>{
  if(route.request().method()==='OPTIONS'){await route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*'}});return;}
  retries++;
  await route.fulfill({contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({...properties[0],_id:id(7),title:'Recovered rental home'})});
 });
 await page.goto(`/properties/${id(7)}`);
 await expect(page).toHaveTitle('Property Temporarily Unavailable | RentzyPro');
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, follow');
 await expect(page.getByRole('heading',{name:'We couldn’t load this property.'})).toBeVisible();
 expect(api.calls.filter(call=>call.path===`/properties/${id(7)}`)).toHaveLength(0);
 await expect(page.getByRole('button',{name:'Try again',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Try again',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Recovered rental home',exact:true})).toBeVisible();
 expect(retries).toBe(1);
});

test('rental page and legitimate location page include real inventory without duplicate browser requests',async({page,api})=>{
 await page.goto('/rent');
 await expect(page.locator('article')).toHaveCount(12);
 await expect(page.locator('meta[name="description"]')).toHaveAttribute('content',/29 available properties for rent/);
 expect(api.calls.filter(call=>call.path==='/properties'&&call.params.get('purpose')==='rent')).toHaveLength(0);
 await page.goto('/search?city=hisar&purpose=rent&utm_source=seo');
 await expect(page).toHaveTitle('properties for rent in Hisar | RentzyPro');
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://rentzypro.com/search?city=Hisar&purpose=rent');
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','index, follow');
 await expect(page.locator('article')).toHaveCount(12);
 expect(api.calls.filter(call=>call.path==='/search')).toHaveLength(0);
 await ready(page,'select');
 await page.locator('select:visible').filter({has:page.locator('option[value="newest"]')}).selectOption('newest');
 await expect(page).toHaveURL(/sort=newest/);
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, follow');
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://rentzypro.com/search');
 await page.goBack();
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://rentzypro.com/search?city=Hisar&purpose=rent');
});

test('empty or unavailable location data and low-value listing filters remain noindex',async({request})=>{
 for(const route of ['/search?city=Nowhere','/search?city=Unavailable','/search?city=Hisar&page=2','/properties?type=room','/buy?sort=price','/rent?city=Hisar']) {
  const response=await request.get(route);expect(response.status()).toBe(200);
  expect(await response.text()).toContain('content="noindex, follow"');
 }
});
