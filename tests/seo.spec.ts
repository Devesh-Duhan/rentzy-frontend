import { test, expect, signIn, ready } from './fixtures/test';
import { SITE_SEO, PAGE_SEO, pageMetadata, canonicalUrl } from '../src/seo';

declare global { interface Window { __seoNavigationMarker?: string } }
const pages: Record<string, { description: string; robots?: { index: boolean } }> = PAGE_SEO;

test('every public static route returns one title, description and production canonical', async ({ request }) => {
  test.setTimeout(300_000); // Allow a cold development server to compile every route.
  for (const [route, config] of Object.entries(pages)) {
    if (config.robots?.index === false) continue;
    const response = await request.get(`${route}?utm_source=seo-test`);
    expect(response.status(), route).toBe(200);
    const html = await response.text();
    expect(html.match(/<title>/g), route).toHaveLength(1);
    expect(html.match(/<meta name="description"/g), route).toHaveLength(1);
    expect(html.match(/<link rel="canonical"/g), route).toHaveLength(1);
    expect(html).toContain(`href="${canonicalUrl(route)}"`);
    expect(html).toContain('content="index, follow"');
    expect(html).toContain('property="og:site_name" content="RentzyPro"');
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
    expect(html).toContain(`${SITE_SEO.baseUrl}/images/logo.png`);
    expect(html).not.toContain('content="noindex');
  }
});

test('native client navigation replaces metadata, keeps state and removes query duplicates', async ({ page }) => {
  await page.goto('/about?utm_source=seo-test');
  await ready(page, 'a[href="/contact"]');
  await page.evaluate(() => { window.__seoNavigationMarker = 'preserved'; });
  for (const route of ['/contact', '/privacy', '/terms', '/blog']) {
    await ready(page, `a[href="${route}"]`);
    await page.locator(`a[href="${route}"]`).evaluateAll((links, route) => {
      // React's click handler exercises Next Link even for a footer link below the fold.
      const link = links.find(link => link instanceof HTMLAnchorElement);
      if (!link) throw new Error(`Missing internal link ${route}`);
      (link as HTMLAnchorElement).click();
    }, route);
    await expect(page).toHaveURL(new RegExp(`${route}(?:\\?|$)`));
    await expect(page).toHaveTitle(pageMetadata(route).title.absolute);
    await expect(page.locator('title')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', pages[route].description);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonicalUrl(route));
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonicalUrl(route));
    expect(await page.evaluate(() => window.__seoNavigationMarker)).toBe('preserved');
  }
  await page.goto('/login');
  await ready(page, 'a[href="/register"]');
  await page.evaluate(() => { window.__seoNavigationMarker = 'auth-preserved'; });
  await page.locator('a[href="/register"]').first().click();
  await expect(page).toHaveTitle(pageMetadata('/register').title.absolute);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonicalUrl('/register'));
  expect(await page.evaluate(() => window.__seoNavigationMarker)).toBe('auth-preserved');
});

test('private panels are noindex; robots and sitemap allow login and registration', async ({ context, request, baseURL }) => {
  test.setTimeout(180_000);
  await signIn(context, baseURL!, 'admin');
  for (const route of ['/admin', '/seller', '/profile', '/chat', '/wishlist', '/alerts', '/notifications/preferences', '/add', '/owners']) {
    const response = await context.request.get(route);
    expect(response.status(), route).toBe(200);
    expect(await response.text(), route).toContain('content="noindex, nofollow"');
  }
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Allow: /');
  expect(robots).not.toMatch(/Disallow: \/(?:login|register)/);
  expect(robots).toContain('Sitemap: https://rentzypro.com/sitemap.xml');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const route of ['/login', '/register', '/rent', '/blog']) expect(sitemap).toContain(`<loc>${canonicalUrl(route)}</loc>`);
  for (const route of ['/admin', '/seller', '/profile', '/search', '/forgot-password']) expect(sitemap).not.toContain(`<loc>${canonicalUrl(route)}</loc>`);
  expect(sitemap).not.toContain('localhost');
});
