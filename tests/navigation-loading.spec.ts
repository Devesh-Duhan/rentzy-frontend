import { test, expect, signIn, noOverflow } from './fixtures/test';
import { properties, propertyResults } from './fixtures/data.mjs';
import type { Page } from '@playwright/test';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
async function holdApi(page: Page, path: string, response: (url: URL) => unknown, matches: (url: URL) => boolean = () => true, status = 200) {
  let release!: () => void, calls = 0;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route(url => url.pathname === path && matches(url), async route => {
    if (route.request().method() === 'OPTIONS') { await route.fulfill({ status: 204, headers: cors }); return; }
    expect(route.request().method()).toBe('GET');
    calls++;
    await pending;
    // Canceled queries may already have gone away when a held response is released.
    await route.fulfill({ status, headers: cors, contentType: 'application/json', body: JSON.stringify(response(new URL(route.request().url()))) }).catch(() => {});
  });
  return { release, calls: () => calls };
}

for (const [path, heading] of [['/buy', /^Properties for (?:Sale|Sell)$/], ['/rent', 'Properties for Rent']] as const) {
  test(`${path} renders controls and skeletons before the listing API responds`, async ({ page }) => {
    const api = await holdApi(page, '/api/properties', url => propertyResults(url.searchParams));
    try {
      await page.goto(path);
      await expect.poll(api.calls).toBeGreaterThan(0);
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
      await expect(page.getByRole('status', { name: 'Loading properties', exact: true })).toBeVisible();
      await expect(page.getByPlaceholder('Search by location, property name...')).toBeEditable();
      const wasDark = await page.locator('html').evaluate(element => element.classList.contains('dark'));
      if (page.viewportSize()!.width < 768) {
        await page.getByRole('button', { name: 'Menu', exact: true }).click();
        await page.getByRole('button', { name: /Switch to (light|dark) theme/ }).click();
        await page.getByRole('button', { name: 'Close menu', exact: true }).click();
      } else await page.getByRole('button', { name: 'Toggle theme', exact: true }).click();
      await expect.poll(() => page.locator('html').evaluate(element => element.classList.contains('dark'))).toBe(!wasDark);
      expect(await page.locator('article').count()).toBe(0);
      api.release();
      await expect(page.locator('article')).toHaveCount(12);
      await expect(page.getByRole('status', { name: 'Loading properties', exact: true })).toHaveCount(0);
      await noOverflow(page);
    } finally { api.release(); }
  });

  test(`${path} keeps cards visible while the next page loads`, async ({ page }) => {
    const api = await holdApi(page, '/api/properties', url => propertyResults(url.searchParams), url => url.searchParams.get('page') === '2');
    try {
      await page.goto(path);
      await expect(page.locator('article')).toHaveCount(12);
      const firstTitle = await page.locator('article').first().getByRole('heading').innerText();
      await page.getByRole('button', { name: 'Next page', exact: true }).click();
      await expect.poll(api.calls).toBeGreaterThan(0);
      await expect(page.getByText('Updating properties...', { exact: true })).toBeVisible();
      await expect(page.locator('article')).toHaveCount(12);
      await expect(page.locator('article').first().getByRole('heading')).toHaveText(firstTitle);
      await expect(page.getByRole('button', { name: 'Next page', exact: true })).toBeDisabled();
      const secondPage = page.getByRole('button', { name: 'Next page', exact: true }).locator('..').getByRole('button', { name: '2', exact: true });
      await expect(secondPage).toBeDisabled();
      api.release();
      await expect(page.locator('article').first().getByRole('heading')).toHaveText(properties[12].title);
      await expect(secondPage).toBeEnabled();
      await expect(page.getByText('Updating properties...', { exact: true })).toHaveCount(0);
    } finally { api.release(); }
  });
}

test('sell renders its page and CTA while testimonials load', async ({ page }) => {
  const api = await holdApi(page, '/api/testimonials', () => [{ _id: 'testimonial', name: 'Slow API Seller', text: 'The listing process was easy.', rating: 5 }]);
  try {
    await page.goto('/sell');
    await expect.poll(api.calls).toBeGreaterThan(0);
    await expect(page.getByRole('heading', { name: /Sell Your Property Faster & Easier/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Post Your Property', exact: true }).first()).toBeEnabled();
    await expect(page.getByRole('status', { name: 'Loading testimonials', exact: true })).toBeVisible();
    api.release();
    await expect(page.getByText('Slow API Seller', { exact: true })).toBeVisible();
    await noOverflow(page);
  } finally { api.release(); }
});

test('seller overview shows actions immediately, loads sections independently and reuses cached reads', async ({ page, context, baseURL }) => {
  await signIn(context, baseURL!, 'seller');
  const stats = await holdApi(page, '/api/properties/seller-stats', () => ({ totalProperties: 17, totalViews: 100, totalInquiries: 3, avgRating: 4.5, performanceData: [10, 20, 30] }));
  const visits = await holdApi(page, '/api/visits', () => []);
  const reviews = await holdApi(page, '/api/reviews/seller', () => []);
  try {
    await page.goto('/seller');
    await expect(page.getByRole('link', { name: 'Add New Property', exact: true })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Loading Total Properties', exact: true })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Loading recent activities', exact: true })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Loading Recent Reviews', exact: true })).toBeVisible();
    await expect.poll(stats.calls).toBe(1);
    stats.release();
    await expect(page.getByText('Total Properties', { exact: true }).locator('..')).toContainText('17');
    await expect(page.getByRole('status', { name: 'Loading performance', exact: true })).toHaveCount(0);
    await expect(page.getByRole('status', { name: 'Loading recent activities', exact: true })).toBeVisible();
    visits.release();
    reviews.release();
    await expect(page.getByRole('status', { name: 'Loading recent activities', exact: true })).toHaveCount(0);
    await expect(page.getByRole('status', { name: 'Loading Recent Reviews', exact: true })).toHaveCount(0);
    await page.getByRole('link', { name: 'Edit Profile', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Business Profile', exact: true })).toBeVisible();
    await page.goBack();
    await expect(page.getByRole('link', { name: 'Add New Property', exact: true })).toBeVisible();
    expect(stats.calls()).toBe(1);
    expect(visits.calls()).toBe(1);
    expect(reviews.calls()).toBe(1);
    await noOverflow(page);
  } finally { stats.release(); visits.release(); reviews.release(); }
});

test('seller listings keep search and Add visible while data loads', async ({ page, context, baseURL }) => {
  await signIn(context, baseURL!, 'seller');
  const api = await holdApi(page, '/api/properties/my', () => properties.slice(0, 2));
  try {
    await page.goto('/seller/properties');
    await expect(page.getByRole('heading', { name: 'My Listings', exact: true })).toBeVisible();
    await expect(page.getByPlaceholder('Search my properties...')).toBeEditable();
    await expect(page.getByRole('link', { name: 'Add', exact: true })).toHaveAttribute('href', '/add');
    await expect(page.getByRole('status', { name: 'Loading your properties', exact: true })).toBeVisible();
    await expect(page.getByText('No properties found', { exact: true })).toHaveCount(0);
    api.release();
    await expect(page.getByRole('heading', { name: properties[0].title, exact: true })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Loading your properties', exact: true })).toHaveCount(0);
    await noOverflow(page);
  } finally { api.release(); }
});

test('seller reviews render controls without an unused property-list request', async ({ page, context, baseURL, api: fixture }) => {
  await signIn(context, baseURL!, 'seller');
  const api = await holdApi(page, '/api/reviews/seller', () => [{ _id: 'review', reviewerName: 'Test reviewer', text: 'Delayed review content.', rating: 4, createdAt: '2026-01-01', property: properties[0] }]);
  try {
    await page.goto('/seller/reviews');
    await expect(page.getByRole('heading', { name: 'Reviews', level: 2, exact: true })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Loading reviews', exact: true })).toBeVisible();
    await page.getByRole('combobox').nth(1).selectOption('rating');
    expect(fixture.calls.some(call => call.path === '/properties/my')).toBe(false);
    api.release();
    await expect(page.getByText('Delayed review content.', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reply', exact: true })).toBeVisible();
  } finally { api.release(); }
});

test('listing errors preserve the page and retry without a full reload', async ({ page }) => {
  let fail = true, documents = 0;
  page.on('request', request => { if (request.isNavigationRequest() && request.resourceType() === 'document') documents++; });
  await page.route(url => url.pathname === '/api/properties', async route => {
    if (route.request().method() === 'OPTIONS') { await route.fulfill({ status: 204, headers: cors }); return; }
    const body = fail ? { message: 'Properties temporarily unavailable' } : propertyResults(new URL(route.request().url()).searchParams);
    await route.fulfill({ status: fail ? 400 : 200, headers: cors, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.goto('/buy');
  await expect(page.getByRole('heading', { name: 'Something went wrong', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: /^Properties for (?:Sale|Sell)$/, exact: true })).toBeVisible();
  fail = false;
  const previousDocuments = documents;
  await page.getByRole('button', { name: 'Try Again', exact: true }).click();
  await expect(page.locator('article')).toHaveCount(12);
  expect(documents).toBe(previousDocuments);
});

test('Browse navigation remains usable while APIs are pending and cancels the old listing request', async ({ page }) => {
  const canceled: string[] = [];
  page.on('requestfailed', request => {
    const url = new URL(request.url());
    if (url.pathname === '/api/properties' && url.searchParams.get('purpose') === 'sell') canceled.push(request.url());
  });
  const api = await holdApi(page, '/api/properties', url => propertyResults(url.searchParams));
  try {
    await page.goto('/buy');
    await expect(page.getByRole('status', { name: 'Loading properties', exact: true })).toBeVisible();
    if (page.viewportSize()!.width < 1024) await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await page.getByRole('link', { name: 'Rent', exact: true }).click();
    await expect(page).toHaveURL(/\/rent$/, { timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'Properties for Rent', exact: true })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Loading properties', exact: true })).toBeVisible();
    await expect.poll(() => canceled.length).toBeGreaterThan(0);
    api.release();
    await expect(page.locator('article')).toHaveCount(12);
  } finally { api.release(); }
});
