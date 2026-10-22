import { test, expect, signIn, noOverflow } from './fixtures/test';
import { properties } from './fixtures/data.mjs';
import type { Page } from '@playwright/test';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
async function hold(page: Page, path: string, data: unknown, status = 200) {
  let release!: () => void, calls = 0;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route(url => url.pathname === '/api' + path, async route => {
    if (route.request().method() === 'OPTIONS') { await route.fulfill({ status: 204, headers: cors }); return; }
    expect(route.request().method()).toBe('GET');
    calls++; await gate;
    await route.fulfill({ status, headers: cors, contentType: 'application/json', body: JSON.stringify(data) }).catch(() => {});
  });
  return { release, calls: () => calls };
}

for (const [path, heading, endpoint, label, data] of [
  ['/projects', 'Property Developers & Builders', '/properties', 'Loading developers', { properties: properties.slice(0, 2) }],
  ['/testimonials', 'What Our Users Say', '/testimonials', 'Loading testimonials', { data: [{ _id: 't1', name: 'Loading test customer', rating: 5, content: 'Testimonial ready.' }] }],
  ['/category/apartment', 'apartment', '/categories/apartment', 'Loading category properties', { data: { name: 'Apartment', slug: 'apartment', sub: [] } }],
] as const) {
  test(path + ' keeps its shell usable before API completion', async ({ page }) => {
    const api = await hold(page, endpoint, data);
    try {
      await page.goto(path);
      await expect.poll(api.calls).toBeGreaterThan(0);
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
      await expect(page.getByRole('status', { name: label, exact: true })).toBeVisible();
      if (path === '/projects') await expect(page.getByRole('link', { name: 'List Your Properties', exact: true })).toBeVisible();
      if (path === '/testimonials') await expect(page.getByRole('button', { name: 'All', exact: true })).toBeEnabled();
      if (path.startsWith('/category')) await expect(page.getByPlaceholder('Search in apartment...')).toBeEditable();
      api.release();
      await expect(page.getByRole('status', { name: label, exact: true })).toHaveCount(0);
      await noOverflow(page);
    } finally { api.release(); }
  });
}

test('comparison waits only for selected records and loads the chooser on demand', async ({ page }) => {
  const api = await hold(page, '/properties/' + properties[0]._id, properties[0]);
  const chooser = await hold(page, '/properties', { properties });
  try {
    await page.goto('/compare?ids=' + properties[0]._id);
    await expect(page.getByRole('heading', { name: 'Compare Properties', exact: true })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Loading comparison', exact: true })).toBeVisible();
    expect(chooser.calls()).toBe(0);
    api.release();
    await page.getByRole('button', { name: 'Add Property', exact: true }).click();
    await expect(page.getByPlaceholder('Search properties...').last()).toBeEditable();
    await expect(page.getByRole('status', { name: 'Loading comparison options', exact: true })).toBeVisible();
    chooser.release();
    await expect(page.getByRole('status', { name: 'Loading comparison options', exact: true })).toHaveCount(0);
  } finally { api.release(); chooser.release(); }
});

test('empty comparison does not fetch an unused property catalogue', async ({ page, api }) => {
  await page.goto('/compare');
  await expect(page.getByRole('link', { name: 'Browse Properties', exact: true })).toBeVisible();
  expect(api.calls.some(call => call.path === '/properties')).toBe(false);
});

test('article appears before its related-articles request finishes', async ({ page }) => {
  const article = await hold(page, '/blogs/loading-test', { data: { _id: 'article-test', title: 'Immediately available article', content: '<p>Article body is ready.</p>', author: { name: 'Test author' }, categories: [], createdAt: '2026-01-01' } });
  const related = await hold(page, '/blogs', { data: [] });
  try {
    await page.goto('/blog/loading-test');
    await expect(page.getByRole('link', { name: 'Back to All Articles', exact: true })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Loading article', exact: true })).toBeVisible();
    article.release();
    await expect(page.getByRole('heading', { name: 'Immediately available article', exact: true })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Loading related articles', exact: true })).toBeVisible();
    await expect.poll(related.calls).toBeGreaterThan(0);
    related.release();
    await expect(page.getByRole('status', { name: 'Loading related articles', exact: true })).toHaveCount(0);
    await noOverflow(page);
  } finally { article.release(); related.release(); }
});


for (const [path, heading, endpoint, label, data] of [
  ['/admin', 'Administrative Insight', '/admin/stats', 'Loading Total Users', { totalUsers: 12, totalProperties: 8, totalBookings: 3, totalRevenue: 200 }],
  ['/admin/featured', 'Featured Properties', '/admin/properties', 'Loading featured properties', []],
  ['/admin/verification', 'Property Verification', '/admin/properties', 'Loading property verification', []],
  ['/admin/seo', 'SEO Settings', '/settings/admin', 'Loading SEO settings', { metaTitle: 'Existing SEO title' }],
  ['/admin/settings', 'Platform Settings', '/settings/admin', 'Loading platform settings', { title: 'Existing platform name' }],
  ['/admin/properties', 'Properties', '/properties/admin/all', 'Loading admin properties', properties.slice(0, 1)],
  ['/admin/reviews', 'Reviews', '/reviews', 'Loading admin reviews', []],
  ['/admin/reports', 'System Reports', '/admin/payments', 'Loading transactions', []],
  ['/admin/activity', 'Activity Log', '/admin/activity', '', []],
  ['/admin/analytics', 'Analytics', '/admin/analytics', '', {}],
  ['/admin/users', 'Identity Vault', '/admin/users', '', []],
  ['/admin/categories', 'Property Categories', '/admin/categories', '', []],
  ['/admin/locations', 'Territory Locations', '/admin/locations', '', []],
  ['/admin/blogs', 'Blog & Content Hub', '/admin/blogs', '', { data: [] }],
  ['/admin/testimonials', 'Testimonials', '/admin/testimonials', '', []],
  ['/admin/faqs', 'FAQ Management', '/admin/faqs', '', []],
  ['/admin/leads', 'Lead Management', '/admin/leads', '', []],
  ['/admin/subscription-plans', 'Subscription Plans', '/admin/subscription-plans', '', []],
  ['/admin/visits', 'Visit Management', '/visits', '', []],
  ['/admin/newsletter', 'Newsletter', '/admin/newsletter-subscribers', '', []],
] as const) {
  test(path + ' keeps admin navigation and page controls visible during its API call', async ({ page, context, baseURL }) => {
    await signIn(context, baseURL!, 'admin');
    const api = await hold(page, endpoint, data);
    try {
      await page.goto(path);
      await expect.poll(api.calls).toBeGreaterThan(0);
      await expect(page.getByRole('heading', { name: heading, exact: true }).last()).toBeVisible();
      if (label) await expect(page.getByRole('status', { name: label, exact: true })).toBeVisible();
      if (path === '/admin/featured' || path === '/admin/verification') await expect(page.getByPlaceholder('Search properties...')).toBeEditable();
      if (path === '/admin/settings' || path === '/admin/seo') await expect(page.getByRole('button', { name: 'Save Changes', exact: true })).toBeDisabled();
      api.release();
      if (label) await expect(page.getByRole('status', { name: label, exact: true })).toHaveCount(0);
      if (path === '/admin/settings' || path === '/admin/seo') {
        await expect(page.getByRole('button', { name: 'Save Changes', exact: true })).toBeEnabled();
        await expect(page.locator(path.endsWith('/seo') ? 'input[name="metaTitle"]' : 'input[name="title"]')).toHaveValue(path.endsWith('/seo') ? 'Existing SEO title' : 'Existing platform name');
      }
      if (path === '/admin/activity') expect(api.calls()).toBe(1);
    } finally { api.release(); }
  });
}

test('admin export renders immediately without downloading data', async ({ page, context, baseURL, api }) => {
  await signIn(context, baseURL!, 'admin');
  await page.goto('/admin/exports');
  await expect(page.getByRole('heading', { name: 'Export Center', exact: true })).toBeVisible();
  expect(api.calls.some(call => call.path.startsWith('/admin/'))).toBe(false);
});

test('profile saved and recent tabs never flash a false empty state', async ({ page, context, baseURL }) => {
  await signIn(context, baseURL!);
  await context.addInitScript(id => localStorage.setItem('recentlyViewed', JSON.stringify([id])), properties[0]._id);
  const saved = await hold(page, '/saved-properties', [properties[0]]);
  const recent = await hold(page, '/properties/' + properties[0]._id, properties[0]);
  try {
    await page.goto('/profile');
    await page.getByRole('button', { name: 'Saved Properties', exact: true }).click();
    await expect(page.getByRole('status', { name: 'Loading saved properties', exact: true })).toBeVisible();
    await expect(page.getByText('No saved properties', { exact: true })).toHaveCount(0);
    saved.release();
    await expect(page.getByRole('status', { name: 'Loading saved properties', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Recent Views', exact: true }).click();
    await expect(page.getByRole('status', { name: 'Loading recently viewed properties', exact: true })).toBeVisible();
    await expect(page.getByText('No recently viewed properties', { exact: true })).toHaveCount(0);
    recent.release();
    await expect(page.getByRole('status', { name: 'Loading recently viewed properties', exact: true })).toHaveCount(0);
  } finally { saved.release(); recent.release(); }
});

test('chat renders its header while the conversation list is pending', async ({ page, context, baseURL }) => {
  await signIn(context, baseURL!);
  await context.routeWebSocket('**/*', socket => socket.close());
  const api = await hold(page, '/chats', []);
  try {
    await page.goto('/chat');
    await expect(page.getByRole('heading', { name: 'Your Messages', level: 2, exact: true })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Loading conversations', exact: true })).toBeVisible();
    await expect(page.getByText('No chats yet.', { exact: true })).toHaveCount(0);
    api.release();
    await expect(page.getByText('No chats yet.', { exact: true })).toBeVisible();
  } finally { api.release(); }
});

test('property editing renders the wizard shell without allowing a blank record to be saved', async ({ page, context, baseURL }) => {
  await signIn(context, baseURL!, 'seller');
  const api = await hold(page, '/properties/my/' + properties[0]._id, properties[0]);
  try {
    await page.goto('/add?edit=' + properties[0]._id);
    await expect(page.getByRole('heading', { name: 'List Your Property', exact: true })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Loading property for editing', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Next Step/ })).toBeDisabled();
    api.release();
    await expect(page.getByRole('status', { name: 'Loading property for editing', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Next Step/ })).toBeEnabled();
    await expect(page.locator('input[name="title"]')).toHaveValue(properties[0].title);
  } finally { api.release(); }
});


for (const [path, endpoint, data] of [
  ['/', '/properties', { properties, pages: 2, count: properties.length }],
  ['/properties', '/properties', { properties, pages: 2, count: properties.length }],
  ['/search', '/search', { properties, pages: 2, count: properties.length }],
  ['/gallery', '/properties', { properties }],
  ['/rera', '/property-documents/public', { documents: [] }],
  ['/wishlist', '/saved-properties', []],
  ['/alerts', '/alerts', []],
  ['/notifications/preferences', '/notification-preferences', { preferences: { newsletter: { email: false, push: false } } }],
  ['/featured-properties/1', '/properties', { properties, pages: 2, count: properties.length }],
  ['/blog', '/blogs', { data: [] }],
  ['/seller/notifications', '/notifications', { notifications: [], unreadCount: 0 }],
] as const) {
  test(path + ' preserves its existing nonblocking data region', async ({ page, context, baseURL }) => {
    await signIn(context, baseURL!, path.startsWith('/seller') ? 'seller' : 'buyer');
    const api = await hold(page, endpoint, data);
    try {
      await page.goto(path);
      if (path === '/') await page.getByRole('heading', { name: 'Featured properties', exact: true }).scrollIntoViewIfNeeded();
      await expect.poll(api.calls).toBeGreaterThan(0);
      await expect(page.getByRole('heading').first()).toBeVisible();
      expect(await page.locator('.animate-pulse, .animate-spin').count()).toBeGreaterThan(0);
      if (path === '/notifications/preferences') await expect(page.getByRole('button', { name: 'Save Preferences', exact: true })).toBeDisabled();
      api.release();
      if (path === '/notifications/preferences') await expect(page.getByRole('button', { name: 'Save Preferences', exact: true })).toBeEnabled();
    } finally { api.release(); }
  });
}


for (const path of ['/admin/settings', '/admin/seo']) {
  test(path + ' cannot overwrite settings after a failed initial read and can retry', async ({ page, context, baseURL }) => {
    await signIn(context, baseURL!, 'admin');
    const api = await hold(page, '/settings/admin', { message: 'Settings unavailable' }, 400);
    try {
      await page.goto(path);
      await expect(page.getByRole('button', { name: 'Save Changes', exact: true })).toBeDisabled();
      api.release();
      await expect(page.getByRole('alert').filter({ hasText: 'Could not load settings' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Save Changes', exact: true })).toBeDisabled();
      await page.route(url => url.pathname === '/api/settings/admin', route => route.fulfill({ headers: cors, contentType: 'application/json', body: JSON.stringify({ title: 'Recovered settings', metaTitle: 'Recovered SEO' }) }));
      await page.getByRole('button', { name: 'Try again', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Save Changes', exact: true })).toBeEnabled();
      await expect(page.locator(path.endsWith('/seo') ? 'input[name="metaTitle"]' : 'input[name="title"]')).toHaveValue(path.endsWith('/seo') ? 'Recovered SEO' : 'Recovered settings');
    } finally { api.release(); }
  });
}

test('testimonials and Sell reuse a compatible cached response', async ({ page }) => {
  const api = await hold(page, '/testimonials', { data: [{ _id: 't1', name: 'Cached customer', rating: 5, content: 'Shared testimonial.' }] });
  try {
    await page.goto('/testimonials');
    await expect.poll(api.calls).toBe(1);
    api.release();
    await expect(page.getByText('Cached customer', { exact: true })).toBeVisible();
    if (page.viewportSize()!.width < 1024) await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await page.getByRole('link', { name: 'Sell', exact: true }).click();
    await expect(page.getByRole('heading', { name: /Sell Your Property Faster & Easier/ })).toBeVisible();
    await expect(page.getByText('Cached customer', { exact: true })).toHaveCount(1);
    expect(api.calls()).toBe(1);
  } finally { api.release(); }
});


test('opening a chat keeps its header visible while messages animate', async ({ page, context, baseURL }) => {
  await signIn(context, baseURL!);
  await context.routeWebSocket('**/*', socket => socket.close());
  const chats = await hold(page, '/chats', [{ _id: 'chat-loading', buyer: 'cccccccccccccccccccccccc', seller: { _id: 'bbbbbbbbbbbbbbbbbbbbbbbb', name: 'Loading chat owner' } }]);
  const messages = await hold(page, '/chats/chat-loading/messages', [{ _id: 'message-loading', sender: 'bbbbbbbbbbbbbbbbbbbbbbbb', content: 'Pending conversation ready.', createdAt: '2026-01-01' }]);
  chats.release();
  try {
    await page.goto('/chat?chat=chat-loading');
    await expect(page.getByRole('heading', { name: 'Loading chat owner', exact: true })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Loading messages', exact: true })).toBeVisible();
    messages.release();
    await expect(page.getByText('Pending conversation ready.', { exact: true })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Loading messages', exact: true })).toHaveCount(0);
  } finally { chats.release(); messages.release(); }
});
