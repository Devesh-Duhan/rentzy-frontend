import { test, expect, propertyId, signIn, noOverflow } from './fixtures/test';

for (const surface of ['photo', 'title', 'details', 'body'] as const) {
  test(`rent card ${surface} opens the correct property`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/rent');
    await expect(page.getByRole('heading', { name: 'Properties for Rent', exact: true })).toBeVisible();
    const card = page.locator('article').first();
    await expect(card.getByRole('heading', { name: 'commercial property 1', exact: true })).toBeVisible();
    if (surface === 'photo') await card.getByRole('link', { name: 'View commercial property 1', exact: true }).click();
    else if (surface === 'title') await card.getByRole('link', { name: 'commercial property 1', exact: true }).click();
    else if (surface === 'details') await card.getByRole('link', { name: 'View details of commercial property 1', exact: true }).click();
    else {
      const bounds = await card.boundingBox();
      await card.click({ position: { x: 24, y: bounds!.height - 24 } });
    }
    await expect(page).toHaveURL(new RegExp(`/properties/${propertyId}$`), { timeout: 45_000 });
    await expect(page.getByRole('heading', { level: 1, name: 'commercial property 1', exact: true })).toBeVisible();
    await noOverflow(page);
  });
}

test('rent photo and save controls work without opening the card', async ({ page, context, baseURL, api }) => {
  await signIn(context, baseURL!);
  await page.goto('/rent');
  const card = page.locator('article').first();
  await expect(card).toBeVisible();
  await card.hover();
  await card.getByRole('button', { name: 'Next property photo', exact: true }).click();
  await expect(card.getByText('2 / 2', { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/rent$/);
  await card.getByRole('button', { name: 'Save property', exact: true }).click();
  await expect(card.getByRole('button', { name: 'Remove from saved properties', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(api.saved).toBe(true);
  await expect(page).toHaveURL(/\/rent$/);
});
