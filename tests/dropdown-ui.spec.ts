import { test, expect, signIn, testUser, noOverflow } from './fixtures/test';
import { properties } from './fixtures/data.mjs';
import type { Locator } from '@playwright/test';

async function modern(select: Locator) {
  await expect(select).toBeVisible();
  const style = await select.evaluate(element => {
    const css = getComputedStyle(element);
    return { radius: css.borderRadius, arrow: css.backgroundImage, height: element.getBoundingClientRect().height, font: parseFloat(css.fontSize), appearance: css.appearance };
  });
  expect(style.radius).toBe('14px');
  expect(style.arrow).toContain('data:image/svg+xml');
  expect(style.height).toBeGreaterThanOrEqual(44);
  expect(style.appearance).toBe('base-select');
  return style;
}

test('Buy native picker selects a city, updates its query and closes with Escape', async ({ page, api }) => {
  await page.goto('/buy');
  if (page.viewportSize()!.width < 1280) await page.getByRole('button', { name: 'Filters', exact: true }).click();
  const select = page.locator('select:visible').first();
  const style = await modern(select);
  if (page.viewportSize()!.width < 768) expect(style.font).toBe(16);
  await select.click();
  const option = page.getByRole('option', { name: 'Hisar', exact: true });
  await expect(option).toBeVisible();
  await option.click();
  await expect(select).toHaveValue('Hisar');
  await expect.poll(() => api.calls.some(call => call.path === '/properties' && call.params.get('city') === 'Hisar')).toBe(true);
  await select.click(); await page.keyboard.press('Escape'); await expect(select).toBeFocused();
  await page.screenshot({ path: `D:/Desktop/Rent/.task/modern-dropdowns/buy-${page.viewportSize()!.width}.png` });
  await noOverflow(page);
});

test('Home search dropdown changes purpose and resets its dependent budget', async ({ page }) => {
  await page.goto('/');
  if (page.viewportSize()!.width < 768) await page.getByRole('button', { name: /Start your search/ }).click();
  const form = page.locator('form:visible').first();
  const purpose = form.getByLabel('Listing purpose', { exact: true });
  const budget = form.getByLabel('Maximum budget', { exact: true });
  await modern(purpose);
  await budget.selectOption('20000');
  await purpose.click(); await page.getByRole('option', { name: 'Buy a home', exact: true }).click();
  await expect(purpose).toHaveValue('sell'); await expect(budget).toHaveValue('');
  await expect(budget.locator('option[value="2500000"]')).toHaveCount(1);
  await noOverflow(page);
});

test('Seller review picker supports keyboard selection without submitting a form', async ({ page, context, baseURL }) => {
  await signIn(context, baseURL!, 'seller');
  await page.route(/\/api\/reviews\/seller(?:\?|$)/, route => route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' }, json: [] }));
  await page.goto('/seller/reviews');
  const sort = page.locator('select').nth(1); await modern(sort);
  await sort.focus(); await page.keyboard.press('Space'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
  await expect(sort).toHaveValue('rating'); await noOverflow(page);
});

test('Admin profile dropdowns stay above the modal and preserve unsaved changes', async ({ page, context, baseURL }) => {
  await signIn(context, baseURL!, 'admin');
  await page.route(/\/api\/admin\/users(?:\?|$)/, route => route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' }, json: [testUser('seller')] }));
  await page.goto('/admin/users');
  await page.getByTitle('Modify Entity', { exact: true }).click();
  const role = page.locator('select[name="role"]'); await modern(role);
  await role.click(); await role.getByRole('option', { name: 'Buyer', exact: true }).click(); await expect(role).toHaveValue('buyer');
  const status = page.locator('select[name="status"]'); await modern(status);
  await status.click(); await page.getByRole('option', { name: 'Warning', exact: true }).click(); await expect(status).toHaveValue('Warning');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(role).toHaveCount(0); await noOverflow(page);
});

test('Admin plan dropdown uses the dark palette and its picker fits the viewport', async ({ page, context, baseURL }) => {
  await signIn(context, baseURL!, 'admin'); await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await page.route(/\/api\/admin\/subscription-plans(?:\?|$)/, route => route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' }, json: [] }));
  await page.goto('/admin/subscription-plans'); await page.getByRole('button', { name: 'Add Plan', exact: true }).click();
  const duration = page.locator('#plan-duration'); await modern(duration);
  expect(await duration.evaluate(element => getComputedStyle(element).color)).toBe('rgb(226, 232, 240)');
  await duration.click();
  const quarter = page.getByRole('option', { name: 'Quarterly', exact: true }); await expect(quarter).toBeVisible();
  const bounds = (await quarter.boundingBox())!; expect(bounds.y).toBeGreaterThanOrEqual(0); expect(bounds.y + bounds.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await page.screenshot({ path: `D:/Desktop/Rent/.task/modern-dropdowns/admin-dark-${page.viewportSize()!.width}.png` });
  await quarter.click(); await expect(duration).toHaveValue('90');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
});

test('Account dropdown retains the login action and shared panel styling', async ({ page }) => {
  await page.goto('/');
  if (page.viewportSize()!.width < 1024) {
    await page.getByRole('button', { name: 'Notifications', exact: true }).click();
    const notifications = page.locator('#navbar-notifications'); await expect(notifications).toBeVisible();
    expect(await notifications.evaluate(element => getComputedStyle(element).borderRadius)).toBe('20px');
    await page.getByRole('button', { name: 'Notifications', exact: true }).click();
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await page.locator('#mobile-navigation').getByRole('link', { name: 'Sign In', exact: true }).click();
    await expect(page).toHaveURL(/\/login$/); return;
  }
  await page.getByRole('button', { name: 'User menu', exact: true }).click();
  const menu = page.locator('.app-dropdown-panel').filter({ has: page.getByRole('link', { name: 'Sign In', exact: true }) });
  await expect(menu).toBeVisible();
  expect(await menu.evaluate(element => getComputedStyle(element).borderRadius)).toBe('20px');
  await menu.getByRole('link', { name: 'Sign In', exact: true }).click(); await expect(page).toHaveURL(/\/login$/);
});

test('Comparison dropdown retains property selection with the shared menu', async ({ page }) => {
  await page.goto('/compare?ids=' + properties[0]._id);
  await page.getByRole('button', { name: 'Add Property', exact: true }).click();
  const menu = page.locator('.app-dropdown-panel'); await expect(menu).toBeVisible();
  await menu.getByPlaceholder('Search properties...').fill(properties[1].title);
  await menu.getByRole('button').filter({ hasText: properties[1].title }).click();
  await expect(page).toHaveURL(new RegExp(properties[1]._id)); await expect(menu).toHaveCount(0);
});
