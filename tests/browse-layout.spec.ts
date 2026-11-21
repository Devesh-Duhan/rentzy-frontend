import { test, expect, noOverflow } from './fixtures/test';

for (const route of ['/buy', '/rent']) {
  test(`Buy/Rent layout ${route} keeps desktop filters narrower than readable property cards`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(route);
    await expect(page.locator('article:has(a[href^="/properties/"])').filter({ has: page.locator('h3') }).first()).toBeVisible();
    const sidebar = page.getByRole('complementary', { name: 'Property filters', exact: true });
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => document.documentElement.classList.toggle('dark', theme === 'dark'), theme);
      for (const [width, height] of [[1024, 720], [1280, 800], [1440, 900], [1920, 1080]]) {
        await page.setViewportSize({ width, height });
        await expect(sidebar).toBeVisible();
        const panel = (await sidebar.boundingBox())!;
        const card = (await page.locator('article:has(a[href^="/properties/"])').first().boundingBox())!;
        expect(panel.width).toBeLessThanOrEqual(240);
        expect(panel.width).toBeLessThanOrEqual(card.width + 1);
        expect(card.width).toBeGreaterThanOrEqual(219);
        expect(card.x).toBeGreaterThanOrEqual(panel.x + panel.width + 15);
        expect(panel.y + panel.height).toBeLessThanOrEqual(height + 1);
        await noOverflow(page);
        for (const select of await sidebar.locator('select').all()) {
          const box = (await select.boundingBox())!;
          expect(box.x).toBeGreaterThanOrEqual(panel.x);
          expect(box.x + box.width).toBeLessThanOrEqual(panel.x + panel.width);
        }
        if (width === 1440) await page.screenshot({ path: `D:/Desktop/Rent/.task/browse-filter-sizing/${route.slice(1)}-${theme}-desktop.png` });
      }
    }
  });

  test(`Buy/Rent layout ${route} keeps mobile cards and usable filter actions`, async ({ page }) => {
    for (const [width, height] of [[768, 1024], [393, 851], [320, 568]]) {
      await page.setViewportSize({ width, height });
      await page.goto(route);
      await expect(page.locator('article:has(a[href^="/properties/"])')).toHaveCount(12);
      await expect(page.getByRole('complementary', { name: 'Property filters', exact: true })).not.toBeVisible();
      if (width < 768) {
        const first = (await page.locator('article:has(a[href^="/properties/"])').nth(0).boundingBox())!;
        const second = (await page.locator('article:has(a[href^="/properties/"])').nth(1).boundingBox())!;
        const third = (await page.locator('article:has(a[href^="/properties/"])').nth(2).boundingBox())!;
        await expect.poll(async () => {
          const a = (await page.locator('article:has(a[href^="/properties/"])').nth(0).boundingBox())!;
          const b = (await page.locator('article:has(a[href^="/properties/"])').nth(1).boundingBox())!;
          return Math.abs(a.y - b.y);
        }).toBeLessThan(2);
        expect(second.x).toBeGreaterThan(first.x);
        expect(third.y).toBeGreaterThan(first.y);
      }
      const trigger = page.getByRole('button', { name: 'Filters', exact: true });
      await trigger.click();
      const dialog = page.getByRole('dialog', { name: 'Filters', exact: true });
      await expect(dialog).toBeVisible();
      const commercial = dialog.getByRole('button', { name: 'Commercial', exact: true });
      expect((await commercial.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await commercial.click();
      await dialog.getByLabel('City', { exact: true }).selectOption('Hisar');
      const apply = dialog.getByRole('button', { name: 'View properties', exact: true });
      const action = (await apply.boundingBox())!;
      expect(action.y + action.height).toBeLessThanOrEqual(height + 1);
      await apply.click();
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
      await noOverflow(page);
    }
  });
}
