import { test as base, expect, type BrowserContext, type Page } from '@playwright/test';
import { properties, propertyId, propertyResults } from './data.mjs';

type Role = 'buyer' | 'seller' | 'admin';
type Blog = { _id: string; title: string; slug: string; content: string; status: string; categories: string[]; tags: string[]; featured: boolean; excerpt: string; coverImage: string; publishDate: string; createdAt: string; author: { name: string }; views: number };
type Call = { method: string; path: string; params: URLSearchParams };
export type MockApi = { blogs: Blog[]; calls: Call[]; saved: boolean; propertyError: boolean; blogError: boolean; emptyProperties: boolean; otpError: boolean; syncBlogs: () => Promise<void> };
const newApi = (): MockApi => ({ blogs: [], calls: [], saved: false, propertyError: false, blogError: false, emptyProperties: false, otpError: false, syncBlogs: async () => {} });

export function testUser(role: Role = 'buyer', email = `${role}@example.test`) {
  const id = role === 'admin' ? 'aaaaaaaaaaaaaaaaaaaaaaaa' : role === 'seller' ? 'bbbbbbbbbbbbbbbbbbbbbbbb' : 'cccccccccccccccccccccccc';
  // Synthetic token is only for frontend route guards; this does not test backend JWT verification.
  const payload = Buffer.from(JSON.stringify({ id, role, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
  return { _id: id, name: `Test ${role}`, email, role, token: `test.${payload}.test`, profileImage: '/icon.svg', createdAt: '2026-01-01T00:00:00.000Z' };
}
export async function signIn(context: BrowserContext, baseURL: string, role: Role = 'buyer') {
  const user = testUser(role);
  await context.addCookies([{ name: 'rentzy_token', value: user.token, url: baseURL }]);
  await context.addInitScript(user => { localStorage.setItem('user', JSON.stringify(user)); localStorage.setItem('token', user.token); }, user);
}
export async function ready(page: Page, selector = 'input') {
  await page.locator(selector).first().waitFor({ state: 'attached' });
  await page.waitForFunction(selector => { const element = document.querySelector(selector); return element && Object.keys(element).some(key => key.startsWith('__reactProps')); }, selector);
}
export async function noOverflow(page: Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
}

export const test = base.extend<{ api: MockApi; mockRoutes: void }>({
  api: async ({}, provide) => { await provide(newApi()); },
  mockRoutes: [async ({ context, page, api, baseURL }, provide, testInfo) => {
    const errors: string[] = [], unhandled: string[] = [];
    let releaseLease: (()=>Promise<void>)|undefined;
    if (/(blogs|rendering|structured-data|feed)\.spec\.ts$/.test(testInfo.file)) {
      const apiURL=process.env.SEO_TEST_API_URL || 'http://127.0.0.1:'+(Number(new URL(baseURL!).port)+1);
      if(!['localhost','127.0.0.1'].includes(new URL(apiURL).hostname))throw new Error('Test controls require loopback');
      const owner=testInfo.testId+'-'+testInfo.project.name;
      const send=async(endpoint:string,body:Record<string,unknown>)=>fetch(apiURL+endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner,...body})});
      const deadline=Date.now()+90000;
      while((await send('/__test/lease',{})).status!==200){if(Date.now()>deadline)throw new Error('Test API lease unavailable');await new Promise(resolve=>setTimeout(resolve,100));}
      api.syncBlogs=async()=>{const response=await send('/__test/blogs',{blogs:api.blogs,error:api.blogError});if(!response.ok)throw new Error('Test API snapshot failed');};
      if(/blogs\.spec\.ts$/.test(testInfo.file))await api.syncBlogs();
      releaseLease=async()=>{await send('/__test/lease',{release:true});};
    }
    page.on('pageerror', error => errors.push(error.message));
    let pendingRole: Role = 'buyer';
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url());
      if (!url.pathname.startsWith('/api/')) {
        if (url.origin === new URL(baseURL!).origin) await route.continue();
        else await route.fulfill({ status: 204, body: '' });
        return;
      }
      const path = url.pathname.slice(4), method = request.method();
      if (method === 'OPTIONS') { await route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' } }); return; }
      api.calls.push({ method, path, params: url.searchParams });
      const body = (request.postData() ? request.postDataJSON() : {}) as Partial<Blog> & { email?: string; password?: string; otp?: string; role?: Role; propertyId?: string };
      let status = 200, data: unknown;
      if (path === '/settings') data = {};
      else if (path === '/categories') data = [{ _id: propertyId, name: 'Apartment', slug: 'apartment', isActive: true }];
      else if (path === '/notifications') data = { notifications: [], unreadCount: 0 };
      else if (path === '/properties') {
        status = api.propertyError ? 503 : 200;
        data = api.propertyError ? { message: 'Properties temporarily unavailable' } : api.emptyProperties ? { properties: [], count: 0, pages: 0, page: 1 } : propertyResults(url.searchParams);
      } else if (path.startsWith('/properties/')) {
        data = properties.find(item => item._id === path.split('/').pop()); status = data ? 200 : 404;
      } else if (path.startsWith('/reviews/') || path.startsWith('/price-history/')) data = [];
      else if (path === '/property-documents/public') data = { documents: [] };
      else if (path.startsWith('/saved-properties/check/')) data = { saved: api.saved };
      else if (path === '/saved-properties' && method === 'POST') { api.saved = !api.saved; data = { saved: api.saved }; }
      else if (path === '/saved-properties') data = api.saved ? [properties[0]] : [];
      else if (path === '/auth/login') { status = body.password === 'TestPassword123!' ? 200 : 401; data = status === 200 ? testUser('buyer', body.email) : { message: 'Invalid email or password.' }; }
      else if (path === '/auth/register-otp') { pendingRole = body.role || 'buyer'; status = api.otpError ? 503 : 200; data = { message: api.otpError ? 'Email service unavailable. Try again.' : 'OTP sent.' }; }
      else if (path === '/auth/verify-register-otp') { status = body.otp === '123456' ? 200 : 400; data = status === 200 ? testUser(pendingRole, body.email) : { message: 'Invalid OTP.' }; }
      else if (path === '/admin/properties/pending-count') data = { count: 0 };
      else if (path === '/admin/blogs' && method === 'GET') data = { data: api.blogs };
      else if (path === '/admin/blogs' && method === 'POST') {
        const blog: Blog = { _id: String(api.blogs.length + 1).padStart(24, '0'), title: body.title || '', content: body.content || '', slug: (body.title || '').toLowerCase().replace(/\s+/g, '-'), status: body.status || 'draft', categories: body.categories || [], tags: body.tags || [], featured: Boolean(body.featured), excerpt: body.excerpt || '', coverImage: body.coverImage || '', author: { name: 'Test admin' }, publishDate: new Date().toISOString(), createdAt: new Date().toISOString(), views: 0 };
        api.blogs.unshift(blog); await api.syncBlogs(); status = 201; data = { data: blog };
      } else if (path.startsWith('/admin/blogs/')) {
        const index = api.blogs.findIndex(blog => blog._id === path.split('/').pop());
        if (index < 0) { status = 404; data = { message: 'Blog not found' }; }
        else if (method === 'DELETE') { api.blogs.splice(index, 1); await api.syncBlogs(); data = { message: 'Deleted' }; }
        else if (method === 'PUT') { Object.assign(api.blogs[index], body); await api.syncBlogs(); data = { data: api.blogs[index] }; }
      } else if (path === '/blogs') {
        status = api.blogError ? 503 : 200; data = api.blogError ? { message: 'Blogs unavailable' } : { data: api.blogs.filter(blog => blog.status === 'published') };
      } else if (path.startsWith('/blogs/')) {
        data = { data: api.blogs.find(blog => blog.slug === path.split('/').pop() && blog.status === 'published') }; status = (data as { data?: Blog }).data ? 200 : 404;
      } else { status = 501; data = { message: `Unhandled fixture: ${method} ${path}` }; unhandled.push(`${method} ${path}`); }
      await route.fulfill({ status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data ?? {}) });
    });
    try { await provide(); } finally { await releaseLease?.(); }
    expect(unhandled, 'Add explicit fixtures for unexpected API calls').toEqual([]);
    expect(errors, 'Browser runtime errors').toEqual([]);
  }, { auto: true }],
});
export { expect, propertyId };
