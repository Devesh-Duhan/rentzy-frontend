import {test,expect,ready,noOverflow} from './fixtures/test';
import {seoBlog} from './fixtures/seo-api.mjs';
type Node = Record<string,any>;
const propertyId='999999999999999999999999';
async function schemas(page:import('@playwright/test').Page){return page.locator('script[type="application/ld+json"]').evaluateAll(scripts=>scripts.flatMap(script=>{const value=JSON.parse(script.textContent||'null');return value?.['@graph']||[value];})) as Promise<Node[]>;}

test('raw homepage JSON-LD parses and has one factual Organization and homepage WebSite',async({request,page})=>{
 const response=await request.get('/');expect(response.status()).toBe(200);
 const result=await page.evaluate(html=>{const doc=new DOMParser().parseFromString(html,'text/html');return [...doc.querySelectorAll('script[type="application/ld+json"]')].flatMap(script=>{const value=JSON.parse(script.textContent||'null');return value['@graph']||[value];});},await response.text()) as Node[];
 expect(result.filter(node=>node['@type']==='Organization')).toHaveLength(1);expect(result.filter(node=>node['@type']==='WebSite')).toHaveLength(1);
 const site=result.find(node=>node['@type']==='WebSite')!;expect(site.url).toBe('https://rentzypro.com');expect(site.publisher['@id']).toBe('https://rentzypro.com/#organization');
 for(const node of result){expect(node.telephone).toBeUndefined();expect(node.aggregateRating).toBeUndefined();expect(node.address).toBeUndefined();}
});

test('approved property graph describes actual house/address/area and visible breadcrumbs without product/offer markup',async({page})=>{
 await page.goto('/properties/'+propertyId);const data=await schemas(page);const house=data.find(node=>node['@type']==='House')!,listing=data.find(node=>node['@type']==='RealEstateListing')!;
 expect(house.name).toBe('Sunny & Home');expect(house.numberOfBedrooms).toBe(2);expect(house.floorSize).toEqual({'@type':'QuantitativeValue',value:1250,unitCode:'FTK'});expect(house.address.addressLocality).toBe('Hisar');expect(listing.mainEntity['@id']).toBe(house['@id']);expect(listing.url).toBe('https://rentzypro.com/properties/'+propertyId);
 const trail=data.find(node=>node['@type']==='BreadcrumbList')!;expect(trail.itemListElement.map((node:Node)=>node.position)).toEqual([1,2,3]);await expect(page.getByRole('navigation',{name:'Breadcrumb',exact:true}).getByRole('link',{name:'Properties',exact:true})).toHaveAttribute('href','/properties');
 const ids=data.map(node=>node['@id']).filter(Boolean);expect(new Set(ids).size).toBe(ids.length);
 const serialized=JSON.stringify(data);for(const text of ['"Product"','"Offer"','VacationRental','aggregateRating','reviewRating','priceCurrency','PRIVATE_PAYMENT_MARKER'])expect(serialized).not.toContain(text);
});

test('published article has matching BlogPosting, reliable optional facts and no fabricated author credentials',async({page})=>{
 await page.goto('/blog/published-guide');const data=await schemas(page);const post=data.find(node=>node['@type']==='BlogPosting')!;
 expect(post.headline).toBe(seoBlog.title);expect(post.author).toEqual({'@type':'Person',name:'Test editor'});expect(post.datePublished).toBe('2026-01-01T00:00:00.000Z');expect(post.dateModified).toBeUndefined();expect(post.mainEntityOfPage['@id']).toBe('https://rentzypro.com/blog/published-guide');expect(data.filter(node=>node['@type']==='BreadcrumbList')).toHaveLength(1);
 await expect(page.getByRole('navigation',{name:'Breadcrumb',exact:true}).getByRole('link',{name:'Blog',exact:true})).toHaveAttribute('href','/blog');await expect(page.locator('main h4')).toHaveCount(0);await expect(page.getByText('Verified Author & Real Estate Advisor')).toHaveCount(0);await expect(page.locator('main img').first()).toHaveAttribute('alt',seoBlog.title);
 expect(JSON.stringify(data)).not.toContain('PRIVATE_AUTHOR_EMAIL');await noOverflow(page);
});

test('rental and indexable location collections describe displayed records; low-value filters have no location schema',async({page,request})=>{
 for(const route of ['/rent','/search?city=Hisar&purpose=rent']){await page.goto(route);const data=await schemas(page);const collection=data.find(node=>node['@type']==='CollectionPage')!;expect(collection.mainEntity.numberOfItems).toBe(12);expect(collection.mainEntity.itemListElement).toHaveLength(12);expect(collection.mainEntity.itemListElement[0].url).toContain('/properties/');expect(collection.url).toBe('https://rentzypro.com'+route);}
 const response=await request.get('/search?city=Hisar&sort=newest');expect(await response.text()).not.toContain('id="location-collection-schema"');
});

test('collection JSON-LD updates with client filters instead of retaining stale initial records',async({page})=>{
 await page.goto('/rent');await ready(page,'button');
 if(await page.getByRole('button',{name:'Filters',exact:true}).isVisible())await page.getByRole('button',{name:'Filters',exact:true}).click();
 await page.getByRole('button',{name:'Commercial',exact:true}).click();
 if(await page.getByRole('dialog',{name:'Filters',exact:true}).isVisible())await page.getByRole('button',{name:'View properties',exact:true}).click();
 await page.getByRole('button',{name:'Next page',exact:true}).click();await expect(page.locator('article')).toHaveCount(7);
 await expect.poll(async()=>{const collection=(await schemas(page)).find(node=>node['@type']==='CollectionPage');return collection?.mainEntity.numberOfItems;}).toBe(7);
 const collection=(await schemas(page)).find(node=>node['@type']==='CollectionPage')!;expect(collection.mainEntity.itemListElement.every((item:Node)=>item.name.startsWith('commercial property'))).toBe(true);await expect(page.locator('#rental-collection-schema')).toHaveCount(1);
});

test('property/article contextual links are crawlable actual public routes and footer avoids fallback category 404s',async({page,request})=>{
 await page.goto('/properties/'+propertyId);const links=page.getByRole('navigation',{name:'Related property searches'});await expect(links.getByRole('link',{name:'Browse rental properties',exact:true})).toHaveAttribute('href','/rent');await expect(links.getByRole('link',{name:'Properties in Hisar',exact:true})).toHaveAttribute('href','/search?city=Hisar');
 for(const href of await links.locator('a').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')!)))expect((await request.get(href)).status()).toBe(200);
 await page.goto('/blog/published-guide');const explore=page.getByRole('navigation',{name:'Explore available properties'});await expect(explore.getByRole('link',{name:'Browse rental properties',exact:true})).toHaveAttribute('href','/rent');await expect(explore.getByRole('link',{name:'Browse all properties',exact:true})).toHaveAttribute('href','/properties');
 const hrefs=await page.locator('footer a').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')||''));expect(hrefs.some(href=>href.startsWith('/properties?type='))).toBe(true);expect(hrefs.some(href=>href.startsWith('/category/'))).toBe(false);
});

test('private/unavailable records never get property or article entities',async({request,page})=>{
 for(const path of ['/properties/333333333333333333333333','/properties/888888888888888888888888','/blog/private-draft','/blog/does-not-exist','/blog/unavailable']){
  const response=await request.get(path);const html=await response.text();const types=await page.evaluate(html=>[...new DOMParser().parseFromString(html,'text/html').querySelectorAll('script[type="application/ld+json"]')].flatMap(script=>{const value=JSON.parse(script.textContent||'null');return(value['@graph']||[value]).map((node:Record<string,unknown>)=>node['@type']);}),html);
  expect(types).not.toContain('RealEstateListing');expect(types).not.toContain('BlogPosting');expect(types).not.toContain('Product');
 }
});

test('client navigation removes old page entities without duplicating persistent organization markup',async({page})=>{
 await page.goto('/properties/'+propertyId);await ready(page,'a[href="/rent"]');await page.getByRole('navigation',{name:'Related property searches'}).getByRole('link',{name:'Browse rental properties',exact:true}).click();await expect(page).toHaveURL(/\/rent$/);await expect(page.locator('#property-schema')).toHaveCount(0);await expect(page.locator('#rental-collection-schema')).toHaveCount(1);await expect(page.locator('#organization-schema')).toHaveCount(1);
 await page.goBack();await expect(page.locator('#property-schema')).toHaveCount(1);await expect(page.locator('#rental-collection-schema')).toHaveCount(0);await expect(page.locator('#organization-schema')).toHaveCount(1);
});
