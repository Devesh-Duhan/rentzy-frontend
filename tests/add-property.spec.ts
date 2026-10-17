import { test, expect, signIn, ready } from './fixtures/test';
import { properties } from './fixtures/data.mjs';

const listing = { ...properties[0], title: 'Synthetic free listing', type: ['apartment'], contactNumber: '9999999999', bedrooms: 7, bathrooms: 6, isPaid: true };
const image = { name: 'interior.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9ioAAAAASUVORK5CYII=', 'base64') };

for (const editing of [false, true]) {
  test(`seller ${editing ? 'edits an unpaid draft' : 'creates a listing'} without opening either gateway`, async ({ page, context, baseURL, api }) => {
    await signIn(context, baseURL!, 'seller');
    const writes: string[] = [];
    let saved = false;
    await page.route(/\/api\/properties(?:\/[^?]*)?(?:\?.*)?$/, async route => {
      const path = new URL(route.request().url()).pathname;
      const method = route.request().method();
      let data;
      if (method === 'GET' && path === `/api/properties/my/${listing._id}`) data = { ...listing, isPaid: false };
      else if (method === 'GET' && path === '/api/properties/my') data = saved ? [listing] : [];
      else if (method === 'POST' && path === '/api/properties') {
        expect(route.request().postData()).toContain('Synthetic free listing');
        expect(route.request().postData()).toMatch(/name="bedrooms"\r\n\r\n7\r\n/);
        expect(route.request().postData()).toMatch(/name="bathrooms"\r\n\r\n6\r\n/);
        writes.push(method); saved = true; data = { success: true, property: listing };
      } else if (method === 'PUT' && path === `/api/properties/${listing._id}`) {
        expect(route.request().postData()).toMatch(/name="bedrooms"\r\n\r\n7\r\n/);
        expect(route.request().postData()).toMatch(/name="bathrooms"\r\n\r\n6\r\n/);
        writes.push(method); saved = true; data = listing;
      } else { await route.fallback(); return; }
      await route.fulfill({ status: method === 'POST' ? 201 : 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) });
    });
    await page.goto(editing ? `/add?edit=${listing._id}` : '/add');
    await ready(page, 'input[name="title"]');
    const review = page.getByRole('button', { name: 'Step 4: Review', exact: true });
    await expect(review).toBeDisabled();
    if (editing) await expect(page.locator('input[name="title"]')).toHaveValue(listing.title);
    else {
      await page.locator('input[name="title"]').fill(listing.title);
      await page.locator('input[name="district"]').fill('Hisar');
      await page.locator('input[name="contactNumber"]').fill(listing.contactNumber);
      await page.locator('textarea[name="description"]').fill(listing.description);
    }
    await page.getByRole('button', { name: '5+', exact: true }).click();
    await expect(page.getByRole('spinbutton', { name: 'Bedrooms', exact: true })).toHaveValue('5');
    await page.getByRole('spinbutton', { name: 'Bedrooms', exact: true }).fill('7');
    await page.getByRole('spinbutton', { name: 'Bathrooms', exact: true }).fill('6');
    await page.getByRole('button', { name: 'Next Step' }).click();
    await page.locator('input[name="rent"]').fill('18500');
    await page.getByRole('button', { name: 'Next Step' }).click();
    if (!editing) await page.locator('input[type="file"]').first().setInputFiles(image);
    await page.getByRole('button', { name: 'Next Step' }).click();
    await expect(page.getByRole('button', { name: 'Confirm & Publish' })).toBeVisible();
    if (editing) {
      for (let count = 0; count < 3; count++) await page.getByRole('button', { name: 'Previous', exact: true }).click();
    } else await page.getByRole('button', { name: 'Step 1: Basics', exact: true }).click();
    await expect(page.getByRole('spinbutton', { name: 'Bedrooms', exact: true })).toHaveValue('7');
    await expect(page.getByRole('spinbutton', { name: 'Bathrooms', exact: true })).toHaveValue('6');
    await expect(review).toBeEnabled();
    await page.locator('input[name="title"]').fill('');
    await review.click();
    await expect(page.locator('input[name="title"]').locator('..').getByText('Title is required', { exact: true })).toBeVisible();
    await page.locator('input[name="title"]').fill(listing.title);
    await page.getByRole('spinbutton', { name: 'Bedrooms', exact: true }).fill('-1');
    await review.click();
    await expect(page.locator('#bedrooms-error')).toBeVisible();
    await page.getByRole('spinbutton', { name: 'Bedrooms', exact: true }).fill('7');
    await page.getByRole('spinbutton', { name: 'Bathrooms', exact: true }).fill('1.5');
    await review.click();
    await expect(page.locator('#bathrooms-error')).toBeVisible();
    await page.getByRole('spinbutton', { name: 'Bathrooms', exact: true }).fill('6');
    await review.click();
    await expect(page.getByRole('button', { name: 'Confirm & Publish' })).toBeVisible();
    await page.getByRole('button', { name: 'Step 2: Pricing', exact: true }).click();
    await expect(page.locator('input[name="rent"]')).toHaveValue('18500');
    await page.locator('input[name="rent"]').fill('');
    await review.click();
    await expect(page.locator('input[name="rent"]').locator('..').getByText('Rent is required', { exact: true })).toBeVisible();
    await page.locator('input[name="rent"]').fill('18500');
    await review.click();
    await expect(page.getByRole('button', { name: 'Confirm & Publish' })).toBeVisible();
    expect(writes).toEqual([]);
    await page.getByRole('button', { name: 'Confirm & Publish' }).click();
    await expect(page).toHaveURL(/\/seller\/properties$/);
    await expect(page.getByRole('heading', { name: listing.title, exact: true })).toBeVisible();
    expect(writes).toEqual([editing ? 'PUT' : 'POST']);
    await expect(page.getByText('Choose Payment Method', { exact: true })).toHaveCount(0);
    expect(api.calls.some(call => /listing-(order|payment)/.test(call.path))).toBe(false);
    expect(await page.locator('script[src*="razorpay.com"],script[src*="cashfree.com"]').count()).toBe(0);
  });
}
