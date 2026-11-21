import { test, expect, signIn, noOverflow } from './fixtures/test';

const cors = { 'Access-Control-Allow-Origin': '*' };

test('admin-authored testimonial content appears on Sell cards and opens without another API call', async ({ page, context, baseURL }) => {
  await signIn(context, baseURL!, 'admin');
  const testimonials: Record<string, unknown>[] = [];
  let publicRequests = 0;
  await page.route('**/api/admin/testimonials', async route => {
    if (route.request().method() === 'POST') {
      testimonials.push({ ...route.request().postDataJSON(), _id: '123456789012345678901234' });
      return route.fulfill({ status: 201, json: testimonials[0], headers: cors });
    }
    return route.fulfill({ json: testimonials, headers: cors });
  });
  await page.route('**/api/testimonials', route => {
    publicRequests++;
    return route.fulfill({ json: { success: true, data: testimonials }, headers: cors });
  });
  await page.goto('/admin/testimonials');
  await page.getByRole('button', { name: 'Add Testimonial' }).click();
  const form = page.getByRole('dialog', { name: 'New Testimonial' });
  const content = 'The listing details helped me prepare for enquiries.\nI could explain the property clearly.';
  await form.getByLabel('Full Name').fill('Test seller');
  await form.getByLabel('Content', { exact: true }).fill(content);
  await form.getByRole('button', { name: 'Create Testimonial' }).click();
  await expect(form).not.toBeVisible();
  await expect(page.getByText('Test seller', { exact: true })).toBeVisible();
  await page.goto('/sell');
  const card = page.getByRole('button', { name: 'Read testimonial from Test seller', exact: true });
  await card.scrollIntoViewIfNeeded();
  await expect(card).toContainText(content);
  await card.click();
  const dialog = page.getByRole('dialog', { name: 'Testimonial from Test seller' });
  await expect(dialog.locator('[data-testimonial-content]')).toHaveText(content);
  await expect(dialog.getByRole('img', { name: '5 out of 5 stars' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(card).toBeFocused();
  expect(publicRequests).toBe(1);
  await noOverflow(page);
});

test('full testimonial dialog supports keyboard, long plain text, legacy records and mobile scrolling', async ({ page }) => {
  const content = 'Message from the admin form.\n' + 'A'.repeat(200) + '\n' + 'The full details remain readable. '.repeat(15) + '\n<img src=x onerror=alert(1)> Last line.';
  await page.route('**/api/testimonials', route => route.fulfill({ headers: cors, json: { data: [
    { _id: '1', name: 'Long testimonial', content, text: 'Stale legacy text must not replace content.', rating: 3, location: 'Hisar' },
    { _id: '2', name: 'Legacy seller', comment: 'Older testimonial message.', rating: 4, location: { city: 'Hisar' } },
  ] } }));
  await page.goto('/sell');
  const card = page.getByRole('button', { name: 'Read testimonial from Long testimonial', exact: true });
  await card.scrollIntoViewIfNeeded();
  await expect(card).toContainText('Message from the admin form.');
  await expect(card).not.toContainText('Stale legacy text');
  await card.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Testimonial from Long testimonial' });
  await expect(dialog).toBeVisible();
  const bounds = await dialog.boundingBox(), size = page.viewportSize()!;
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(size.width + 1);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(size.height + 1);
  await expect(dialog.locator('[data-testimonial-content]')).toHaveText(content);
  await expect(dialog.locator('img')).toHaveCount(0);
  await expect(dialog.getByRole('img', { name: '3 out of 5 stars' })).toBeVisible();
  await expect(dialog.getByText('Hisar', { exact: true })).toBeVisible();
  const contentArea = dialog.locator('[data-testimonial-content]').locator('..');
  await contentArea.evaluate(element => { element.scrollTop = element.scrollHeight; });
  const scroll = await contentArea.evaluate(element => ({ actual: element.scrollTop, required: element.scrollHeight - element.clientHeight }));
  expect(scroll.actual).toBeGreaterThanOrEqual(scroll.required - 1);
  const backgroundY = await page.evaluate(() => scrollY);
  await page.mouse.move(4, size.height / 2);
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => scrollY)).toBe(backgroundY);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(card).toBeFocused();
  const legacy = page.getByRole('button', { name: 'Read testimonial from Legacy seller', exact: true });
  await legacy.scrollIntoViewIfNeeded();
  await legacy.focus();
  await page.keyboard.press('Space');
  const legacyDialog = page.getByRole('dialog', { name: 'Testimonial from Legacy seller' });
  await expect(legacyDialog.locator('[data-testimonial-content]')).toHaveText('Older testimonial message.');
  await legacyDialog.getByRole('button', { name: 'Close testimonial', exact: true }).click();
  await expect(legacyDialog).not.toBeVisible();
  await noOverflow(page);
});
