import { test, expect, ready, noOverflow } from './fixtures/test';
import { seoBlog } from './fixtures/seo-api.mjs';

const content = '# Before you rent\n\nCompare **real listings** with [rental homes](/rent).\n\n| Home | Price |\n| --- | --- |\n| Apartment | 12000 |\n\n- [x] Check the details\n- [ ] Schedule a visit\n\n```js\nconst price = 12000;\n```\n\n```text\n' + 'long-value-'.repeat(40) + '\n```\n\n![Brand image](/images/logo.png)\n\n<script>window.__markdownUnsafe = true</script>\n\n<img src="/images/logo.png" alt="Sanitized image" onload="window.__markdownUnsafe = true">';

test('blog Markdown renders in initial HTML, hydrates, refreshes and navigates', async ({ page, api, request }) => {
  api.blogs = [{ ...seoBlog, content, featured: false, createdAt: seoBlog.publishDate }];
  await api.syncBlogs();
  const response = await request.get('/blog/published-guide');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('<h2>Before you rent</h2>');
  expect(html).toContain('<strong>real listings</strong>');
  expect(html).toContain('<table>');
  expect(html).toContain('hljs-keyword');
  const hydrationErrors: string[] = [];
  page.on('console', message => { if (message.type() === 'error' && /hydrat|did not match/i.test(message.text())) hydrationErrors.push(message.text()); });
  await page.goto('/blog/published-guide');
  await ready(page, 'main a');
  const viewer = page.locator('.markdown-body');
  await expect(viewer.getByRole('heading', { level: 2, name: 'Before you rent' })).toBeVisible();
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(viewer.locator('table th')).toHaveCount(2);
  await expect(viewer.locator('input[type="checkbox"]')).toHaveCount(2);
  await expect(viewer.locator('input[type="checkbox"]').first()).toBeDisabled();
  await expect(viewer.locator('code .hljs-keyword')).toHaveText('const');
  await expect(viewer.getByRole('img', { name: 'Brand image', exact: true })).toHaveAttribute('loading', 'lazy');
  await expect(viewer.locator('script,[onload],[onerror]')).toHaveCount(0);
  expect(await page.evaluate(() => (window as typeof window & { __markdownUnsafe?: boolean }).__markdownUnsafe)).toBeUndefined();
  await noOverflow(page);
  const lightColor = await viewer.evaluate(element => getComputedStyle(element).color);
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  expect(await viewer.evaluate(element => getComputedStyle(element).color)).not.toBe(lightColor);
  await noOverflow(page);
  await page.reload();
  await expect(viewer.getByRole('heading', { name: 'Before you rent' })).toBeVisible();
  await ready(page, '.markdown-body');
  await viewer.getByRole('link', { name: 'rental homes', exact: true }).click();
  await expect(page).toHaveURL(/\/rent$/);
  await page.goBack();
  await expect(viewer.getByRole('heading', { name: 'Before you rent' })).toBeVisible();
  expect(hydrationErrors).toEqual([]);
});

test('Markdown is visible with JavaScript disabled', async ({ browser, baseURL, api }) => {
  api.blogs = [{ ...seoBlog, content, featured: false, createdAt: seoBlog.publishDate }];
  await api.syncBlogs();
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(baseURL!).origin ? route.continue() : route.fulfill({ status: 204, body: '' }));
    const page = await context.newPage();
    await page.goto('/blog/published-guide');
    await expect(page.getByRole('heading', { name: 'Before you rent' })).toBeVisible();
    await expect(page.locator('.markdown-body strong')).toHaveText('real listings');
    await noOverflow(page);
  } finally { await context.close(); }
});
