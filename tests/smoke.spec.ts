import { test, expect, noOverflow } from './fixtures/test';

test('homepage keeps categories in separate scrollable rows', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Fresh places. New possibilities.' })).toBeVisible();
  const commercial = page.locator('#category-commercial-properties');
  await page.locator('#category-commercial').scrollIntoViewIfNeeded();
  await expect(commercial.locator('article')).toHaveCount(8);
  for (const count of [16, 19]) {
    await commercial.evaluate(element => element.scrollTo({ left: element.scrollWidth, behavior: 'instant' }));
    await expect(commercial.locator('article')).toHaveCount(count);
  }
  const residential = page.locator('#category-residential-properties');
  await page.locator('#category-residential').scrollIntoViewIfNeeded();
  await expect(residential.locator('article')).toHaveCount(5);
  await noOverflow(page);
  expect(await page.locator('img').evaluateAll(images => images.every(image => image.hasAttribute('alt')))).toBe(true);
});

test('footer categories stay cached during page navigation', async ({ page, api }) => {
  await page.goto('/properties');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(page.locator('footer').getByText('Apartment', { exact: true })).toBeVisible();
  for (const path of ['/buy', '/rent', '/properties']) {
    await page.locator(`a[href="${path}"]:visible`).first().click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect(page.locator('footer').getByText('Apartment', { exact: true })).toBeVisible();
  }
  expect(api.calls.filter(call => call.path === '/categories')).toHaveLength(1);
  expect(api.calls.filter(call => call.path === '/ping')).toHaveLength(0);
});
