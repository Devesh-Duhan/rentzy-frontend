import { test, expect, testUser, ready } from './fixtures/test';
import type { BrowserContext } from '@playwright/test';

const week = Number(process.env.NEXT_PUBLIC_SESSION_MAX_AGE_SECONDS ?? 604800);
function account(role: 'buyer' | 'seller' | 'admin', age = 0, lifetime = week) {
  const user = testUser(role), iat = Math.floor(Date.now() / 1000) - age;
  user.token = 'test.' + Buffer.from(JSON.stringify({ id: user._id, role, iat, exp: iat + lifetime })).toString('base64url') + '.test';
  return { user, iat };
}
async function seed(context: BrowserContext, baseURL: string, user: ReturnType<typeof testUser>) {
  await context.addCookies([{ name: 'rentzy_token', value: user.token, url: baseURL }]);
  await context.addInitScript(user => {
    if (localStorage.getItem('__sessionTestSeed')) return;
    localStorage.setItem('__sessionTestSeed', '1');
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', user.token);
  }, user);
}
async function cleared(page: import('@playwright/test').Page) {
  await expect.poll(() => page.evaluate(() => localStorage.getItem('token'))).toBe(null);
  expect(await page.evaluate(() => localStorage.getItem('user'))).toBe(null);
  expect((await page.context().cookies()).filter(cookie => ['token', 'rentzy_token'].includes(cookie.name))).toEqual([]);
}

for (const role of ['buyer', 'seller', 'admin'] as const) {
  test(`${role} automatically signs out at the configured deadline without an API request`, async ({ page, context, baseURL, api }) => {
    const { user, iat } = account(role);
    await seed(context, baseURL!, user);
    await page.clock.install({ time: new Date(iat * 1000) });
    await page.goto('/about');
    await expect.poll(() => api.calls.some(call => call.path === '/notifications')).toBe(true);
    const cookie = (await context.cookies()).find(cookie => cookie.name === 'rentzy_token')!;
    // Chromium cookie expiry uses the real clock; page.clock mocks JavaScript time.
    // Allow their sub-second offset while asserting the actual sign-out deadline below.
    expect(cookie.expires).toBeLessThanOrEqual(iat + week + 5);
    const remaining = (iat + week) * 1000 - await page.evaluate(() => Date.now());
    await page.clock.fastForward(remaining - 1000);
    expect(await page.evaluate(() => Boolean(localStorage.getItem('token')))).toBe(true);
    await page.clock.fastForward(2000);
    await expect(page).toHaveURL(/\/login\?reason=session-expired$/);
    await cleared(page);
    expect(api.calls.some(call => call.path === '/auth/logout')).toBe(false);
  });
}

test('legacy sessions older than the configured limit cannot enter protected routes', async ({ context, baseURL }) => {
  const { user } = account('admin', week + 1, 30 * 86400);
  await context.addCookies([{ name: 'rentzy_token', value: user.token, url: baseURL! }]);
  for (const route of ['/admin', '/seller', '/profile']) {
    const response = await context.request.get(baseURL + route, { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toContain('/login?next=');
  }
});

test('reopening an expired browser session clears local storage and legacy cookies', async ({ page, context, baseURL }) => {
  const { user } = account('seller', week + 1, 30 * 86400);
  await seed(context, baseURL!, user);
  await context.addCookies([{ name: 'token', value: user.token, url: baseURL! }]);
  await page.goto('/about');
  await expect(page).toHaveURL(/\/login\?reason=session-expired$/);
  await cleared(page);
});

test('resuming a suspended tab checks expiry even before its timer fires', async ({ page, context, baseURL, api }) => {
  const { user, iat } = account('buyer');
  await seed(context, baseURL!, user);
  await page.clock.install({ time: new Date(iat * 1000) });
  await page.goto('/about');
  await expect.poll(() => api.calls.some(call => call.path === '/notifications')).toBe(true);
  await page.clock.setFixedTime(new Date((iat + week) * 1000));
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page).toHaveURL(/\/login\?reason=session-expired$/);
  await cleared(page);
});

test('session removal in another tab updates the active tab', async ({ page, context, baseURL, api }) => {
  const { user } = account('buyer');
  await seed(context, baseURL!, user);
  await page.goto('/about');
  await expect.poll(() => api.calls.some(call => call.path === '/notifications')).toBe(true);
  const other = await context.newPage();
  try {
    await other.goto('/about');
    await ready(other, 'a');
    await other.evaluate(() => { localStorage.removeItem('user'); localStorage.removeItem('token'); });
    // The main tab's watcher should immediately switch its account menu to anonymous.
    await page.getByRole('button', { name: page.viewportSize()!.width < 1024 ? 'Menu' : 'User menu', exact: true }).click();
    await expect(page.getByText('Test buyer', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /log in|sign in/i }).first()).toBeVisible();
  } finally { await other.close(); }
});
