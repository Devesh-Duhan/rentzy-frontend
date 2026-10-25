import { test, expect, ready, noOverflow } from './fixtures/test';
import { propertyResults } from './fixtures/data.mjs';

async function mockSearch(page: import('@playwright/test').Page) {
  const calls: URLSearchParams[] = [];
  await page.route(/\/api\/search(?:\?|$)/, async route => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' } });
      return;
    }
    const params = new URL(route.request().url()).searchParams;
    calls.push(params);
    const fixtureParams = new URLSearchParams(params);
    fixtureParams.set('keyword', params.get('q') || '');
    await route.fulfill({ contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(propertyResults(fixtureParams)) });
  });
  return calls;
}

async function openSearchFilters(page: import('@playwright/test').Page) {
  if (page.viewportSize()!.width < 1024) await page.getByRole('button', { name: 'Filter properties', exact: true }).click();
  return page.locator('form[aria-label="Property search filters"]:visible');
}

test('Explore all search applies all filter fields together in one request', async ({ page }) => {
  test.setTimeout(120_000);
  const calls = await mockSearch(page);
  await page.goto('/search');
  await expect(page.locator('article')).toHaveCount(10);
  await ready(page);
  const initialCalls = calls.length;
  const form = await openSearchFilters(page);
  await form.getByLabel('Keyword', { exact: true }).fill('property 1');
  await form.getByLabel('Type', { exact: true }).selectOption('land');
  await form.getByLabel('Purpose', { exact: true }).selectOption('rent');
  await form.getByLabel('City', { exact: true }).fill('Hisar');
  await form.getByLabel('Minimum price', { exact: true }).fill('10000');
  await form.getByLabel('Maximum price', { exact: true }).fill('30000');
  await form.getByLabel('Bedrooms', { exact: true }).selectOption('2');
  await form.getByLabel('Bathrooms', { exact: true }).selectOption('2');
  await form.getByRole('button', { name: 'Furnished', exact: true }).click();
  await form.getByRole('button', { name: 'Owner', exact: true }).click();
  await form.getByLabel('Facing', { exact: true }).selectOption('north');
  await form.getByLabel('Possession', { exact: true }).selectOption('ready-to-move');
  await form.getByLabel('Minimum area', { exact: true }).fill('900');
  await form.getByLabel('Maximum area', { exact: true }).fill('1800');
  expect(calls).toHaveLength(initialCalls);
  await form.getByRole('button', { name: 'Apply Filters', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'land property 1', exact: true })).toBeVisible();
  const expected = { q: 'property 1', type: 'land', purpose: 'rent', city: 'Hisar', minPrice: '10000', maxPrice: '30000', bedrooms: '2', bathrooms: '2', furnishing: 'furnished', postedBy: 'owner', facing: 'north', possession: 'ready-to-move', minArea: '900', maxArea: '1800', page: '1' };
  expect(calls).toHaveLength(initialCalls + 1);
  for (const [key, value] of Object.entries(expected)) {
    expect(calls.at(-1)!.get(key), key).toBe(value);
    expect(new URL(page.url()).searchParams.get(key), key).toBe(value);
  }
  await expect(page.getByRole('dialog', { name: 'Property filters' })).toHaveCount(0);
  await noOverflow(page);
});

test('cancel preserves applied values and Clear resets all filter inputs', async ({ page }) => {
  await mockSearch(page);
  await page.goto('/search?type=land&city=Hisar&q=property');
  await expect(page.locator('article')).toHaveCount(5);
  await ready(page);
  let form = await openSearchFilters(page);
  await expect(form.getByLabel('Keyword', { exact: true })).toHaveValue('property');
  if (page.viewportSize()!.width < 1024) {
    await form.getByLabel('Keyword', { exact: true }).fill('discard this draft');
    await page.getByRole('button', { name: 'Close filters', exact: true }).click();
    form = await openSearchFilters(page);
    await expect(form.getByLabel('Keyword', { exact: true })).toHaveValue('property');
  }
  await form.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page).toHaveURL(/\/search$/, { timeout: 45_000 });
  await expect(form.getByLabel('Keyword', { exact: true })).toHaveValue('');
  await expect(form.getByLabel('City', { exact: true })).toHaveValue('');
  await expect(form.getByLabel('Type', { exact: true })).toHaveValue('');
  await expect(page.locator('article')).toHaveCount(10);
  await page.goBack();
  await expect(page).toHaveURL(/\/search\?type=land&city=Hisar&q=property$/);
  await expect(form.getByLabel('Keyword', { exact: true })).toHaveValue('property');
  await expect(form.getByLabel('City', { exact: true })).toHaveValue('Hisar');
  await expect(form.getByLabel('Type', { exact: true })).toHaveValue('land');
});

test('both mobile filter panels keep Apply reachable and keyword text clear of its icon', async ({ page }) => {
  test.setTimeout(120_000);
  await mockSearch(page);
  await page.setViewportSize({ width: 320, height: 568 });
  for (const path of ['/search', '/properties']) {
    await page.goto(path);
    await expect(page.locator('article')).toHaveCount(10);
    await page.getByRole('button', { name: 'Filter properties', exact: true }).click();
    const panel = page.getByRole('dialog', { name: 'Property filters' });
    const keyword = panel.locator('input[type="text"]').first();
    await keyword.fill('property');
    expect(await keyword.evaluate(input => {
      const icon = input.parentElement!.querySelector('svg')!;
      return input.getBoundingClientRect().left + parseFloat(getComputedStyle(input).paddingLeft) - icon.getBoundingClientRect().right;
    })).toBeGreaterThanOrEqual(8);
    await panel.locator('input').last().scrollIntoViewIfNeeded();
    // A shorter viewport also models the space left when a mobile keyboard opens.
    await page.setViewportSize({ width: 320, height: 400 });
    const apply = panel.getByRole('button', { name: 'Apply Filters', exact: true });
    await expect(apply).toBeInViewport();
    expect(await apply.evaluate(button => {
      const box = button.getBoundingClientRect();
      return button.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
    })).toBe(true);
    await noOverflow(page);
    await page.screenshot({ path: test.info().outputPath(`${path.slice(1)}-mobile-filters.png`), animations: 'disabled' });
    await apply.click();
    await expect(panel).toHaveCount(0);
    await page.setViewportSize({ width: 320, height: 568 });
  }
});
