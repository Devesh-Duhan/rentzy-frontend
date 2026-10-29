import {test,expect,signIn,noOverflow} from './fixtures/test';
import {properties} from './fixtures/data.mjs';
import type {Page} from '@playwright/test';

const cors={'Access-Control-Allow-Origin':'*'};
async function openVerificationMenu(page:Page,isMobile:boolean){
 if(isMobile) await page.getByText('rentzypro Admin',{exact:true}).locator('..').locator('..').getByRole('button').click();
 const link=page.getByRole('link',{name:/^Verification/});
 await link.scrollIntoViewIfNeeded();
 return link;
}

test('verification badge tracks new submissions, approvals and rejection',async({page,context,baseURL,isMobile})=>{
 await signIn(context,baseURL!,'admin');
 await page.clock.install();
 const rows=[
  {...properties[0],_id:'111111111111111111111111',title:'Synthetic pending one',isVerified:false,rejectionReason:''},
  {...properties[0],_id:'222222222222222222222222',title:'Synthetic pending two',isVerified:false,rejectionReason:''},
  {...properties[0],_id:'333333333333333333333333',title:'Synthetic rejected',isVerified:false,rejectionReason:'Needs review'},
  {...properties[0],_id:'444444444444444444444444',title:'Synthetic verified',isVerified:true,rejectionReason:''},
 ];
 let countReads=0;
 await page.route('**/api/admin/properties/pending-count',route=>{
  countReads++;
  return route.fulfill({headers:cors,json:{count:rows.filter(row=>!row.isVerified&&!row.rejectionReason).length}});
 });
 await page.route(/\/api\/admin\/properties(?:\/[a-f\d]{24}\/(?:verify|reject))?$/,async route=>{
  const request=route.request(),parts=new URL(request.url()).pathname.split('/');
  if(request.method()==='GET'){await route.fulfill({headers:cors,json:rows});return;}
  const row=rows.find(item=>item._id===parts[4])!;
  if(parts[5]==='verify'){row.isVerified=true;row.rejectionReason='';}
  else{row.isVerified=false;row.rejectionReason=request.postDataJSON().reason;}
  await route.fulfill({headers:cors,json:row});
 });
 await page.goto('/admin/verification');
 const badge=page.locator('a[href="/admin/verification"] [role="status"]').last();
 await expect(badge).toHaveText('2');
 expect(countReads).toBe(1);
 const link=await openVerificationMenu(page,isMobile);
 await expect(link.getByRole('status')).toHaveText('2');
 await link.click();
 rows.push({...properties[0],_id:'555555555555555555555555',title:'Synthetic new arrival',isVerified:false,rejectionReason:''});
 await page.clock.fastForward(30_001);
 await expect(badge).toHaveText('3');
 await expect(page.getByText('Synthetic new arrival',{exact:true})).toBeVisible();
 await page.getByText('Synthetic pending one',{exact:true}).click();
 await page.getByText('Synthetic pending one',{exact:true}).locator('..').locator('..').locator('..').getByRole('button',{name:'Verify',exact:true}).click();
 await expect(badge).toHaveText('2');
 await page.getByText('Synthetic pending two',{exact:true}).click();
 await page.getByText('Synthetic pending two',{exact:true}).locator('..').locator('..').locator('..').getByRole('button',{name:'Reject',exact:true}).click();
 await page.getByPlaceholder('Provide a reason for rejection...').fill('Synthetic rejection reason');
 await page.getByRole('button',{name:'Reject',exact:true}).last().click();
 await expect(badge).toHaveText('1');
 await page.getByText('Synthetic new arrival',{exact:true}).click();
 await page.getByText('Synthetic new arrival',{exact:true}).locator('..').locator('..').locator('..').getByRole('button',{name:'Verify',exact:true}).click();
 await expect(page.locator('a[href="/admin/verification"] [role="status"]')).toHaveCount(0);
 await noOverflow(page);
});

test('verification badge caps large counts without losing its accessible total',async({page,context,baseURL,isMobile})=>{
 await signIn(context,baseURL!,'admin');
 await page.route('**/api/admin/properties/pending-count',route=>route.fulfill({headers:cors,json:{count:105}}));
 await page.route('**/api/admin/properties',route=>route.fulfill({headers:cors,json:[]}));
 await page.goto('/admin/verification');
 const link=await openVerificationMenu(page,isMobile);
 const badge=link.getByRole('status',{name:'105 properties pending verification'});
 await expect(badge).toHaveText('99+');
 await expect(badge).toBeInViewport();
 await noOverflow(page);
});
