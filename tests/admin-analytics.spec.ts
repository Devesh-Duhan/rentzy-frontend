import{test,expect,signIn,noOverflow}from'./fixtures/test';
const cors={'Access-Control-Allow-Origin':'*'};
function analytics(empty=false){return{
 generatedAt:'2026-01-15T12:00:00.000Z',
 totals:{users:empty?0:9,properties:empty?0:11,leads:empty?0:5,pendingVerification:empty?0:4},
 usersOverTime:empty?[]:[{_id:'2026-01',count:2}],
 propertiesOverTime:empty?[]:[{_id:'2025-08',count:3},{_id:'2026-01',count:1}],
 propertyStatusStats:empty?[]:[{_id:'available',count:8},{_id:'rented',count:1},{_id:'sold',count:2}],
 topProperties:empty?[]:[{property:{_id:'111111111111111111111111',title:'Synthetic most viewed listing',status:'rented'},totalViews:137}],
};}
test('admin analytics renders real API fields, UTC months and refreshed totals without fake growth',async({page,context,baseURL})=>{
 await signIn(context,baseURL!,'admin');
 const data=analytics();let calls=0,release!:()=>void;
 const refresh=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/api/admin/analytics',async route=>{calls++;if(calls>1)await refresh;await route.fulfill({headers:cors,json:data});});
 await page.goto('/admin/analytics');
 const users=page.getByText('Total Users',{exact:true}).locator('..');
 await expect(users).toContainText('9');
 await expect(page.getByText('Total Properties',{exact:true}).locator('..')).toContainText('11');
 await expect(page.getByText('Total Inquiries',{exact:true}).locator('..')).toContainText('5');
 await expect(page.getByText('Pending Verification',{exact:true}).locator('..')).toContainText('4');
 await expect(page.getByText('Aug 25',{exact:true})).toHaveCount(2);
 await expect(page.getByText('Jan 26',{exact:true})).toHaveCount(2);
 await expect(page.getByRole('row').filter({hasText:'Synthetic most viewed listing'})).toContainText('137');
 await expect(page.getByText('Revenue',{exact:true})).toHaveCount(0);
 await expect(page.getByText('Bookings',{exact:true})).toHaveCount(0);
 await expect(page.getByText(/^(12|8|3|15)%$/)).toHaveCount(0);
 const button=page.getByRole('button',{name:'Refresh Data',exact:true});
 try{
  await button.click();await expect(button).toBeDisabled();await expect(users).toContainText('9');
  data.totals.users=10;release();await expect(users).toContainText('10');
  await expect(button).toBeEnabled();expect(calls).toBe(2);await noOverflow(page);
 }finally{release();}
});
test('admin analytics displays an API failure instead of fabricated zero metrics and can retry',async({page,context,baseURL})=>{
 await signIn(context,baseURL!,'admin');let failing=true;
 await page.route('**/api/admin/analytics',route=>route.fulfill({status:failing?503:200,headers:cors,json:failing?{message:'Synthetic service failure'}:analytics()}));
 await page.goto('/admin/analytics');
 await expect(page.getByRole('alert').filter({hasText:'Analytics could not be loaded.'})).toBeVisible();
 await expect(page.getByText('Total Users',{exact:true})).toHaveCount(0);
 failing=false;await page.getByRole('button',{name:'Try again',exact:true}).click();
 await expect(page.getByText('Total Users',{exact:true}).locator('..')).toContainText('9');
 await expect(page.getByText('Analytics could not be loaded.',{exact:true})).toHaveCount(0);
 await noOverflow(page);
});
test('admin analytics preserves actual zero counts and empty state',async({page,context,baseURL})=>{
 await signIn(context,baseURL!,'admin');
 await page.route('**/api/admin/analytics',route=>route.fulfill({headers:cors,json:analytics(true)}));
 await page.goto('/admin/analytics');
 await expect(page.getByText('Total Users',{exact:true}).locator('..').getByRole('heading')).toHaveText('0');
 await expect(page.getByText('No property data available',{exact:true})).toBeVisible();
 await noOverflow(page);
});
