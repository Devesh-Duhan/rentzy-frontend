import { test, expect, ready, noOverflow, signIn } from './fixtures/test';

const routes = ['/', '/rent', '/buy', '/about', '/contact', '/refund-policy', '/safety', '/projects', '/gallery', '/rera', '/tenant-screening', '/mobile-app', '/testimonials', '/whatsapp', '/properties/999999999999999999999999', '/category/commercial', '/search?city=Hisar&purpose=rent'];

test('public content is over 200 words in initial HTML, with one contextual guide and unchanged metadata', async ({ request, page }) => {
  for (const route of routes) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    const result = await page.evaluate(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      doc.querySelectorAll('script,style,svg,template,noscript').forEach(node => node.remove());
      const main = doc.querySelector('main');
      const guide = main?.querySelector('[data-page-guide]');
      return { words: (main?.textContent?.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) || []).length, guides: main?.querySelectorAll('[data-page-guide]').length, headings: doc.querySelectorAll('h1').length, titles: doc.querySelectorAll('title').length, canonicals: doc.querySelectorAll('link[rel="canonical"]').length, unresolved: guide?.textContent?.includes('{subject}'), insideFooter: !!guide?.closest('footer') };
    }, await response.text());
    expect(result.words, route).toBeGreaterThan(200);
    expect(result.guides, route).toBe(1);
    expect(result.headings, route).toBe(1);
    expect(result.titles, route).toBe(1);
    expect(result.canonicals, route).toBe(1);
    expect(result.unresolved, route).toBe(false);
    expect(result.insideFooter, route).toBe(false);
  }
});

test('guidance remains below existing features, visible and responsive after hydration', async ({ page }) => {
  const hydrationErrors: string[] = [];
  page.on('console', message => { if (message.type() === 'error' && /hydrat|did not match/i.test(message.text())) hydrationErrors.push(message.text()); });
  for (const route of ['/', '/rent', '/buy', '/about', '/contact', '/testimonials', '/properties/999999999999999999999999']) {
    await page.goto(route);
    await ready(page, 'a');
    const guide = page.locator('[data-page-guide]');
    await guide.scrollIntoViewIfNeeded();
    await expect(guide).toBeVisible();
    if (route === '/') expect(await page.locator('article').first().evaluate((card, id) => !!(card.compareDocumentPosition(document.querySelector(`[data-page-guide="${id}"]`)!) & Node.DOCUMENT_POSITION_FOLLOWING), 'home')).toBe(true);
    await noOverflow(page);
  }
  expect(hydrationErrors).toEqual([]);
});

test('guidance is useful without JavaScript and does not change approved property descriptions', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(baseURL!).origin ? route.continue() : route.fulfill({ status: 204, body: '' }));
    const page = await context.newPage();
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('[data-page-guide]')).toBeVisible();
      if (route.includes('/properties/')) await expect(page.getByText('A public rental house with natural light.', { exact: true })).toBeVisible();
      // Validate the new server-rendered guide itself; full-page JS layouts are checked above.
      const guideBounds = await page.locator('[data-page-guide]').boundingBox();
      expect(guideBounds).not.toBeNull();
      expect(guideBounds!.x).toBeGreaterThanOrEqual(-1);
      expect(guideBounds!.x + guideBounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
    }
  } finally { await context.close(); }
});

test('account referrals stay private, while invalid and non-indexable result pages get no filler', async ({ request, context, baseURL }) => {
  const referral = await request.get('/refer', { maxRedirects: 0 });
  expect(referral.status()).toBe(307);
  expect(referral.headers().location).toContain('/login?next=%2Frefer');
  expect(referral.headers()['x-robots-tag']).toContain('noindex');
  const sitemap = await request.get('/sitemap-static.xml');
  expect(await sitemap.text()).not.toContain('<loc>https://rentzypro.com/refer</loc>');
  await signIn(context, baseURL!);
  const signedIn = await context.request.get('/refer');
  expect(signedIn.status()).toBe(200);
  expect(await signedIn.text()).toContain('content="noindex, nofollow"');
  for (const route of ['/properties/invalid', '/search?city=NoMatchingCity']) {
    const response = await request.get(route);
    expect(await response.text()).not.toMatch(/data-page-guide="(?:property|location)"/);
  }
});

for (const [path, heading, endpoint, label, data] of [
  ['/projects', 'Property Developers & Builders', '/properties', 'Loading developers', { properties: [] }],
  ['/testimonials', 'What Our Users Say', '/testimonials', 'Loading testimonials', { data: [] }],
] as const) {
  test(path + ' keeps public information usable while its API is pending', async ({ page }) => {
    let release!: () => void, calls = 0;
    const pending = new Promise<void>(resolve => { release = resolve; });
    await page.route(url => url.pathname === '/api' + endpoint, async route => {
      const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
      if (route.request().method() === 'OPTIONS') { await route.fulfill({ status: 204, headers }); return; }
      calls++; await pending;
      await route.fulfill({ headers, contentType: 'application/json', body: JSON.stringify(data) }).catch(() => {});
    });
    try {
      await page.goto(path);
      await expect.poll(() => calls).toBeGreaterThan(0);
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
      await expect(page.getByRole('status', { name: label, exact: true })).toBeVisible();
      await expect(page.locator('[data-page-guide]')).toBeVisible();
      release();
      await expect(page.getByRole('status', { name: label, exact: true })).toHaveCount(0);
    } finally { release(); }
  });
}
