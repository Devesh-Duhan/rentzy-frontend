import {test,expect,ready,noOverflow,propertyId} from './fixtures/test';
import {propertyResults} from './fixtures/data.mjs';

test('marketplace keeps category previews bounded and scrolls to See more',async({page,api})=>{
 await page.goto('/');
 await ready(page,'button');
 const rail=page.locator('#category-commercial-properties');
 await expect(rail.locator('article')).toHaveCount(10);
 await rail.scrollIntoViewIfNeeded();
 await expect.poll(()=>rail.evaluate(element=>{
   const bounds=element.getBoundingClientRect();
   return [...element.querySelectorAll('article')].filter(card=>{const box=card.getBoundingClientRect();return box.left>=bounds.left-1&&box.right<=bounds.right+1;}).length;
 })).toBe(page.viewportSize()!.width<640?2:6);
 await rail.locator('img').evaluateAll(images=>Promise.all(images.map(image=>image.decode().catch(()=>{}))));
 await page.screenshot({path:test.info().outputPath('marketplace.png')});
 await rail.evaluate(element=>element.scrollTo({left:element.scrollWidth,behavior:'instant'}));
 const more=rail.getByRole('link',{name:'See more commercial properties',exact:true});
 await expect(more).toBeInViewport();
 await expect(rail.locator('article')).toHaveCount(10);
 expect(api.calls.filter(call=>call.path==='/properties'&&call.params.get('type')==='commercial')).toHaveLength(1);
 await more.click();
 await expect(page).toHaveURL(/\/properties\?type=commercial$/);
 await expect(page.locator('article').first()).toBeVisible();
 await noOverflow(page);
});

test('destination search applies real rental filters on desktop and mobile',async({page})=>{
 await page.route(/\/api\/search(?:\?|$)/,async route=>{
   if(route.request().method()==='OPTIONS'){await route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'*'}});return;}
   const result=propertyResults(new URL(route.request().url()).searchParams);
   await route.fulfill({contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify(result)});
 });
 await page.goto('/');
 await ready(page,'button');
 const mobile=page.viewportSize()!.width<768;
 if(mobile)await page.getByRole('button',{name:/Start your search/}).click();
 const form=mobile?page.getByRole('dialog',{name:'Search homes',exact:true}):page.getByRole('form',{name:'Search homes',exact:true});
 await form.getByRole('textbox',{name:'City or neighbourhood',exact:true}).fill('Hisar');
 await form.getByRole('combobox',{name:'Property type',exact:true}).selectOption('commercial');
 await form.getByRole('combobox',{name:'Listing purpose',exact:true}).selectOption('sell');
 await form.getByRole('combobox',{name:'Maximum budget',exact:true}).selectOption('5000000');
 await form.getByRole('button',{name:'Search properties',exact:true}).click();
 await expect(page).toHaveURL(/\/search\?/);
 const params=new URL(page.url()).searchParams;
 expect(Object.fromEntries(params)).toMatchObject({city:'Hisar',type:'commercial',purpose:'sell',maxPrice:'5000000'});
 await expect(page.locator('article').first()).toBeVisible();
 await noOverflow(page);
});

test('detail gallery supports image navigation and closes without locking the page',async({page})=>{
 await page.goto(`/properties/${propertyId}`);
 await expect(page.getByRole('heading',{level:1,name:'commercial property 1',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Open image gallery',exact:true}).click();
 const gallery=page.getByRole('dialog',{name:'commercial property 1 image gallery',exact:true});
 await expect(gallery).toBeVisible();
 await expect(gallery.getByText('1 / 5',{exact:true})).toBeVisible();
 await gallery.press('ArrowRight');
 await expect(gallery.getByText('2 / 5',{exact:true})).toBeVisible();
 await gallery.getByRole('button',{name:'Close image viewer',exact:true}).click();
 await expect(gallery).toHaveCount(0);
 expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
 await page.screenshot({path:test.info().outputPath('property-detail.png')});
 await noOverflow(page);
});

test('footer categories stay cached during page navigation',async({page,api})=>{
 await page.goto('/properties');
 await page.locator('footer').scrollIntoViewIfNeeded();
 await expect(page.locator('footer').getByText('Apartment',{exact:true})).toBeVisible();
 for(const path of ['/buy','/rent','/properties']){
   await page.locator(`a[href="${path}"]:visible`).first().click();
   await expect(page).toHaveURL(new RegExp(`${path}$`));
   await page.locator('footer').scrollIntoViewIfNeeded();
   await expect(page.locator('footer').getByText('Apartment',{exact:true})).toBeVisible();
 }
 expect(api.calls.filter(call=>call.path==='/categories')).toHaveLength(1);
 expect(api.calls.filter(call=>call.path==='/ping')).toHaveLength(0);
});

test('responsive account navigation opens the existing login and browse routes',async({page})=>{
 await page.goto('/');
 await ready(page,'button');
 if(page.viewportSize()!.width<1024){
   await page.getByRole('button',{name:'Menu',exact:true}).click();
   const menu=page.locator('#mobile-navigation');
   await expect(menu).toBeVisible();
   expect(await page.evaluate(()=>document.body.style.position)).toBe('fixed');
   await menu.getByRole('link',{name:'Buy',exact:true}).click();
   await expect(page).toHaveURL(/\/buy$/);
   await expect(menu).toHaveCount(0);
   expect(await page.evaluate(()=>document.body.style.position)).not.toBe('fixed');
 }else{
   await page.getByRole('button',{name:'User menu',exact:true}).click();
   await page.getByRole('link',{name:'Sign In',exact:true}).click();
   await expect(page).toHaveURL(/\/login$/);
 }
 await noOverflow(page);
});
