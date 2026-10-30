import { test, expect, propertyId, signIn, ready, noOverflow } from './fixtures/test';

test('property pagination changes the visible results', async ({ page, api }) => {
  await page.goto('/properties');
  await expect(page.locator('article')).toHaveCount(10);
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'commercial property 11', exact: true })).toBeVisible();
  expect(api.calls.some(call => call.path === '/properties' && call.params.get('page') === '2')).toBe(true);
  await page.getByRole('button', { name: 'Previous page', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'commercial property 1', exact: true })).toBeVisible();
  await noOverflow(page);
});

test('search and category filters send the selected query', async ({ page, api }) => {
  await page.goto('/properties');
  await expect(page.locator('article')).toHaveCount(10);
  await page.getByRole('button', { name: 'Filter properties', exact: true }).click();
  await page.locator('input[placeholder="Search properties..."]:visible').fill('property 2');
  await page.getByRole('button', { name: 'Residential', exact: true }).click();
  await page.getByRole('button', { name: 'Apply Filters', exact: true }).click();
  await expect(page.locator('article')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'residential property 2', exact: true })).toBeVisible();
  expect(api.calls.some(call => call.params.get('type') === 'residential' && call.params.get('keyword') === 'property 2')).toBe(true);
});

test('empty property results can be cleared', async ({ page }) => {
  await page.goto('/properties');
  await expect(page.locator('article')).toHaveCount(10);
  await page.getByRole('button', { name: 'Filter properties', exact: true }).click();
  await page.locator('input[placeholder="Search properties..."]:visible').fill('NoMatchingProperty');
  await page.getByRole('button', { name: 'Apply Filters', exact: true }).click();
  await expect(page.getByText('No properties found', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear All Filters', exact: true }).click();
  await expect(page.locator('article')).toHaveCount(10);
});

test('failed property requests show a working retry', async ({ page, api }) => {
  api.propertyError = true;
  await page.goto('/properties');
  await expect(page.getByRole('button', { name: 'Try again', exact: true })).toBeVisible();
  api.propertyError = false;
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.locator('article')).toHaveCount(10);
});

test('card photo controls work and anonymous saving requires login', async ({ page }) => {
  await page.goto('/properties');
  const card = page.locator('article').first();
  await expect(card).toBeVisible();
  await card.hover();
  await card.getByRole('button', { name: 'Next property photo' }).click();
  await expect(card.getByText('2 / 2', { exact: true })).toBeVisible();
  await card.getByRole('button', { name: 'Save property', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test('detail uses SSR data and owner links and saving work', async ({ context, baseURL, page, api }) => {
  await signIn(context, baseURL!);
  await page.goto(`/properties/${propertyId}`);
  await expect(page.getByRole('heading', { name: 'commercial property 1', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Call owner', exact: true })).toHaveAttribute('href', 'tel:+919996002136');
  await expect(page.getByRole('link', { name: 'WhatsApp', exact: true })).toHaveAttribute('href', /^https:\/\/wa.me\/919996002136/);
  await ready(page, 'button');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Saved', exact: true })).toBeVisible();
  expect(api.saved).toBe(true);
  expect(api.calls.filter(call => call.path === `/properties/${propertyId}`)).toHaveLength(0);
  await noOverflow(page);
});


test('featured listings show twelve cards before advancing to the next page', async ({ page, api, isMobile }) => {
  await page.goto('/properties?featured=true');
  await expect(page.locator('article')).toHaveCount(12);
  expect(api.calls.some(call => call.path === '/properties' && call.params.get('featured') === 'true' && call.params.get('limit') === '12')).toBe(true);
  if (!isMobile) expect(await page.locator('article').first().evaluate(card => getComputedStyle(card.parentElement!.parentElement!).gridTemplateColumns.split(' ').length)).toBe(6);
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'commercial property 13', exact: true })).toBeVisible();
  await expect(page.locator('article')).toHaveCount(12);
  await page.getByRole('button', { name: 'Previous page', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'commercial property 1', exact: true })).toBeVisible();
  await noOverflow(page);
});
