import { test, expect, signIn, testUser, noOverflow } from './fixtures/test';

test('Homes filters start above cards, keep actions visible and restore focus', async ({ page }) => {
  const width = page.viewportSize()!.width;
  await page.setViewportSize({ width, height: width < 768 ? 667 : 900 });
  await page.goto('/properties');
  await expect(page.locator('article')).toHaveCount(10);
  const trigger = page.getByRole('button', { name: 'Filter properties', exact: true });
  await trigger.click();
  const panel = width < 1024 ? page.getByRole('dialog', { name: 'Property filters', exact: true }) : page.getByRole('complementary', { name: 'Property filters', exact: true });
  await expect(panel).toBeVisible();
  const keyword = panel.getByPlaceholder('Search properties...', { exact: true });
  await expect(keyword).toBeVisible();
  expect(await keyword.evaluate(el => { const r = el.getBoundingClientRect(); return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === el; })).toBe(true);
  const rect = (await panel.boundingBox())!;
  if (width < 1024) {
    expect(rect.y).toBe(0);
    const apply = (await panel.getByRole('button', { name: 'Apply Filters', exact: true }).boundingBox())!;
    expect(apply.y + apply.height).toBeLessThanOrEqual(667);
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
    const before = await page.evaluate(() => scrollY);
    await page.mouse.move(5, 400); await page.mouse.wheel(0, 500); await page.waitForTimeout(120);
    expect(await page.evaluate(() => scrollY)).toBe(before);
  } else {
    const card = (await page.locator('article').first().boundingBox())!;
    expect(rect.y).toBeLessThanOrEqual(card.y + 2);
    expect(rect.x + rect.width).toBeLessThanOrEqual(card.x);
  }
  await panel.screenshot({ path: `D:/Desktop/Rent/.task/consistent-filters/homes-${width}.png` });
  await panel.getByRole('button', { name: 'Close filters', exact: true }).click();
  if (width < 1024) { await expect(trigger).toBeFocused(); expect(await page.evaluate(() => document.documentElement.style.overflow)).not.toBe('hidden'); }
  await noOverflow(page);
});

for (const path of ['/buy', '/rent']) test(path + ' retains Buy-style quick controls and selected query values', async ({ page, api }) => {
  await page.goto(path); await expect(page.locator('article')).toHaveCount(12);
  const mobile = page.viewportSize()!.width < (path === '/buy' ? 1280 : 1024);
  if (mobile) await page.getByRole('button', { name: 'Filters', exact: true }).click();
  const panel = mobile ? page.getByRole('dialog', { name: 'Filters', exact: true }) : page.getByRole('complementary', { name: 'Property filters', exact: true });
  await panel.getByRole('button', { name: 'Commercial', exact: true }).click();
  await panel.getByLabel('City', { exact: true }).selectOption('Hisar');
  await panel.getByRole('group', { name: 'BHK', exact: true }).getByRole('button', { name: '2', exact: true }).click();
  await expect.poll(() => api.calls.some(call => call.path === '/properties' && call.params.get('type') === 'commercial' && call.params.get('city') === 'Hisar' && call.params.get('bhk') === '2')).toBe(true);
  await expect(panel.getByRole('button', { name: 'Commercial', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(await panel.getByRole('button', { name: 'Commercial', exact: true }).evaluate(el => getComputedStyle(el).backgroundImage)).toContain('linear-gradient');
  await panel.getByRole('button', { name: 'Clear All Filters', exact: true }).click();
  await expect(panel.getByLabel('City', { exact: true })).toHaveValue('All');
  if (mobile) { await panel.getByRole('button', { name: 'View properties', exact: true }).click(); await expect(page.getByRole('dialog')).toHaveCount(0); }
  await noOverflow(page);
});

test('Homes filters remain usable at 320px and switch to a top-aligned desktop panel', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 }); await page.goto('/properties');
  await page.getByRole('button', { name: 'Filter properties', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Property filters', exact: true });
  await expect(dialog).toBeVisible();
  const apply = (await dialog.getByRole('button', { name: 'Apply Filters', exact: true }).boundingBox())!;
  expect(apply.y + apply.height).toBeLessThanOrEqual(568);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('complementary', { name: 'Property filters', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});

test('Gallery search/type/city controls share styling without changing their values', async ({ page }) => {
  await page.goto('/gallery'); const keyword = page.getByPlaceholder('Search by property title...', { exact: true });
  await expect(keyword).toBeVisible();
  expect(await keyword.evaluate(el => getComputedStyle(el).borderRadius)).toBe('12px');
  await expect(page.locator('select').first().locator('option')).not.toHaveCount(1);
  await page.locator('select').first().selectOption('commercial');
  await expect(page.locator('select').first()).toHaveValue('commercial'); await noOverflow(page);
});

test('Admin user search and role filters keep working with the common controls', async ({ page, context, baseURL }) => {
  await signIn(context, baseURL!, 'admin');
  await page.route(/\/api\/admin\/users(?:\?|$)/, route => route.fulfill({ status: route.request().method() === 'OPTIONS' ? 204 : 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' }, contentType: 'application/json', body: route.request().method() === 'OPTIONS' ? '' : JSON.stringify([testUser('buyer'), testUser('seller')]) }));
  await page.goto('/admin/users'); const search = page.getByPlaceholder('Search by name or email...', { exact: true });
  await expect(search).toBeVisible();
  expect(await search.evaluate(el => getComputedStyle(el).borderRadius)).toBe('12px');
  await expect(page.getByText('Test buyer', { exact: true })).toBeVisible();
  const role = page.locator('select').first();
  const seller = await role.locator('option').filter({ hasText: /seller/i }).first().evaluate(el => (el as HTMLOptionElement).value);
  await role.selectOption(seller); await expect(page.getByText('Test seller', { exact: true })).toBeVisible(); await expect(page.getByText('Test buyer', { exact: true })).toHaveCount(0);
  await noOverflow(page);
});

test('Dark Homes filter dialog starts at its keyword with accessible actions', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('theme', 'dark')); await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/properties'); await page.getByRole('button', { name: 'Filter properties', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Property filters', exact: true }); await expect(dialog.getByPlaceholder('Search properties...', { exact: true })).toBeVisible();
  await dialog.screenshot({ path: 'D:/Desktop/Rent/.task/consistent-filters/homes-dark.png' });
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
});
