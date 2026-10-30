import {test,expect,ready} from './fixtures/test';
test('stalled Google popup times out and leaves login retryable',async({page,context})=>{
 const blocked:any[]=[];
 await page.route('**/apis.google.com/**',route=>{blocked.push(route);});
 await page.goto('/login',{waitUntil:'domcontentloaded'});await ready(page,'button');
 await page.clock.install();
 const button=page.getByRole('button',{name:'Sign in with Google',exact:true});
 await button.click();
 await expect(page.getByRole('button',{name:/Opening Google/})).toBeDisabled();
 await page.clock.fastForward(120001);
 await expect(button).toBeEnabled();await expect(page.getByText('Google sign-in did not finish. Close the Google window and try again.')).toBeVisible();
 for(const route of blocked)await route.abort().catch(()=>{});
 for(const popup of context.pages())if(popup!==page)await popup.close();
});
