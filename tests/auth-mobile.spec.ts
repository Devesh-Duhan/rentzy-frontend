import { test, expect, ready, testUser } from './fixtures/test';
import { getAuthDestination } from '../src/lib/authRedirect';
import type { BrowserContext, Page } from '@playwright/test';

type Role = 'buyer' | 'seller' | 'admin';
type Store = { getState(): { auth: unknown }; dispatch(action: unknown): { unwrap(): Promise<unknown> } };
type Fiber = { memoizedProps?: { store?: Store }; child?: Fiber; sibling?: Fiber };
type Runtime = ((id: string) => Record<string, unknown>) & { m: Record<string, { toString(): string }> };
type AuthWindow = Window & { __authTestStore?: Store; webpackChunk_N_E: { push(chunk: unknown[]): void } };
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };

async function captureStore(context: BrowserContext) {
  // Test-only React instrumentation; no production test hooks or real Google accounts.
  await context.addInitScript(() => {
    const visit = (fiber?: Fiber) => {
      if (!fiber) return;
      const store = fiber.memoizedProps?.store;
      if (store?.getState()?.auth) (window as unknown as AuthWindow).__authTestStore = store;
      visit(fiber.child); visit(fiber.sibling);
    };
    Object.assign(window, { __REACT_DEVTOOLS_GLOBAL_HOOK__: {
      supportsFiber: true, inject: () => 1,
      onCommitFiberRoot: (_id: number, root: { current: Fiber }) => visit(root.current),
      onCommitFiberUnmount() {}, onPostCommitFiberRoot() {},
    } });
  });
}

async function completeGoogleExchange(page: Page) {
  // Exercise the actual Google-login thunk after Firebase would return an ID token.
  await page.waitForFunction(() => Boolean((window as unknown as AuthWindow).__authTestStore));
  return page.evaluate(async () => {
    let runtime: Runtime | undefined;
    (window as unknown as AuthWindow).webpackChunk_N_E.push([['auth-test-' + Date.now()], {}, (require: Runtime) => { runtime = require; }]);
    const id = Object.keys(runtime!.m).find(id => runtime!.m[id].toString().includes('auth/googleLogin'));
    if (!id) throw Error('Google auth thunk module not loaded');
    const thunk = Object.values(runtime!(id)).find((value): value is ((token: string) => unknown) & { typePrefix: string } => typeof value === 'function' && 'typePrefix' in value && value.typePrefix === 'auth/googleLogin');
    if (!thunk) throw Error('Google auth thunk export not found');
    try { await (window as unknown as AuthWindow).__authTestStore!.dispatch(thunk('synthetic-google-id-token')).unwrap(); return null; }
    catch (error) { return String(error); }
  });
}

async function mockAccount(page: Page, role: Role, fail = false) {
  const user = testUser(role);
  await page.route(url => url.pathname === '/api/auth/google', async route => {
    if (route.request().method() === 'OPTIONS') { await route.fulfill({ status: 204, headers: cors }); return; }
    expect(route.request().postDataJSON()).toEqual({ idToken: 'synthetic-google-id-token' });
    await route.fulfill({ status: fail ? 401 : 200, headers: cors, json: fail ? { message: 'Google token rejected' } : user });
  });
  for (const [path, data] of [
    ['/api/admin/stats', { totalUsers: 2, totalProperties: 3, totalBookings: 0, totalRevenue: 0 }],
    ['/api/properties/seller-stats', { totalProperties: 0, totalViews: 0, totalInquiries: 0, avgRating: 0, performanceData: [] }],
    ['/api/visits', []], ['/api/users/profile', user],
  ] as const) await page.route(url => url.pathname === path, route => route.fulfill({ status: 200, headers: cors, json: data }));
  return user;
}

for (const path of ['/login', '/register']) for (const role of ['buyer', 'seller', 'admin'] as const) {
  test(`${path} Google completion opens the ${role} destination with a fresh session`, async ({ page, context, baseURL }) => {
    await captureStore(context); const user = await mockAccount(page, role);
    await context.addCookies([{ name: 'token', value: 'expired-legacy-token', url: baseURL!, httpOnly: true }]);
    await page.goto(path); await ready(page);
    await completeGoogleExchange(page);
    const target = role === 'buyer' ? '/' : '/' + role;
    await expect(page).toHaveURL(baseURL + target);
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('user') || '{}').role)).toBe(role);
    expect((await context.cookies()).find(cookie => cookie.name === 'rentzy_token')?.value).toBe(user.token);
    await page.reload(); await expect(page).toHaveURL(baseURL + target);
  });
}

test('Google login returns to a previously anonymous protected page without a redirect loop', async ({ page, context, baseURL }) => {
  await captureStore(context); await mockAccount(page, 'buyer');
  await context.addCookies([{ name: 'token', value: 'expired-legacy-token', url: baseURL!, httpOnly: true }]);
  await page.goto('/');
  if (page.viewportSize()!.width < 1024) await page.getByRole('link', { name: 'Profile', exact: true }).click();
  else await page.goto('/profile');
  await expect(page).toHaveURL(/\/login\?next=%2Fprofile$/); await ready(page, 'input[type="email"]');
  let documents = 0;page.on('request', request => { if (request.isNavigationRequest() && request.resourceType() === 'document') documents++; });
  await completeGoogleExchange(page); await expect(page).toHaveURL(/\/profile$/);
  expect(documents).toBeGreaterThan(0);
});

test('rejected Google exchange stays on login and creates no session', async ({ page, context }) => {
  await captureStore(context); await mockAccount(page, 'buyer', true);
  await page.goto('/login'); await ready(page);
  expect(await completeGoogleExchange(page)).toBe('Google token rejected');
  await expect(page.getByText('Google token rejected', { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  expect((await context.cookies()).some(cookie => cookie.name === 'rentzy_token')).toBe(false);
});

test('new session takes priority and invalid current tokens cannot fall back to a legacy session', async ({ request }) => {
  const user = testUser('buyer');
  const valid = await request.get('/profile', { headers: { Cookie: 'token=expired; rentzy_token=' + user.token }, maxRedirects: 0 });
  expect(valid.status()).toBe(200);
  const invalid = await request.get('/profile', { headers: { Cookie: 'token=' + user.token + '; rentzy_token=invalid' }, maxRedirects: 0 });
  expect(invalid.status()).toBe(307); expect(invalid.headers().location).toContain('/login?next=%2Fprofile');
});

test('redirect destinations reject external URLs, auth loops and unauthorized panels', () => {
  const buyer = { role: 'buyer' };
  for (const next of ['https://evil.test', '//evil.test', '/\\evil.test', '/\nevil.test', '/login', '/register?next=/profile', '/admin', '/seller', '/add']) expect(getAuthDestination(buyer, next)).toBe('/');
  expect(getAuthDestination(buyer, '/profile?tab=saved#top')).toBe('/profile?tab=saved#top');
  expect(getAuthDestination({ role: 'seller' }, '/seller/properties')).toBe('/seller/properties');
  expect(getAuthDestination({ role: 'admin' }, '/admin/users')).toBe('/admin/users');
  expect(getAuthDestination({ role: 'seller' }, '/admin')).toBe('/seller');
});
