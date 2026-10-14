import { test, expect, signIn, ready, noOverflow } from './fixtures/test';

test('admin publishes a blog that opens on the public website', async ({ context, baseURL, page, api }) => {
  await signIn(context, baseURL!, 'admin');
  await page.goto('/admin/blogs');
  await ready(page, 'button');
  await page.getByRole('button', { name: 'Add New Blog', exact: true }).click();
  const modal = page.getByRole('dialog');
  await modal.locator('input[name="title"]').fill('Playwright published article');
  await modal.locator('textarea[name="content"]').fill('A complete article written in isolated browser tests to verify the admin publishing workflow.');
  await modal.getByRole('button', { name: 'Publish Settings', exact: true }).click();
  await expect(modal.getByText('🟢 Will be publicly visible', { exact: true })).toBeAttached();
  await modal.getByRole('button', { name: 'Create Article', exact: true }).click();
  await expect(modal).toHaveCount(0);
  expect(api.blogs[0].status).toBe('published');
  await page.goto('/blog');
  await page.getByRole('link', { name: /Playwright published article/ }).getByRole('heading', { name: 'Playwright published article', exact: true }).click();
  await expect(page).toHaveURL(/\/blog\/playwright-published-article$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Playwright published article', exact: true })).toBeVisible();
  await expect(page.getByText(/A complete article written in isolated browser tests/)).toBeVisible();
  await noOverflow(page);
});

test('admin can save a private draft then publish it', async ({ context, baseURL, page, api }) => {
  await signIn(context, baseURL!, 'admin');
  await page.goto('/admin/blogs');
  await ready(page, 'button');
  await page.getByRole('button', { name: 'Add New Blog', exact: true }).click();
  const modal = page.getByRole('dialog');
  await modal.locator('input[name="title"]').fill('Playwright private draft');
  await modal.locator('textarea[name="content"]').fill('This draft becomes visible only after the administrator explicitly publishes it.');
  await modal.getByRole('button', { name: 'Publish Settings', exact: true }).click();
  await modal.getByRole('button', { name: /Draft Visible only to administrators/ }).click();
  await modal.getByRole('button', { name: 'Create Article', exact: true }).click();
  await expect(modal).toHaveCount(0);
  expect(api.blogs[0].status).toBe('draft');
  await page.goto('/blog');
  await expect(page.getByRole('heading', { name: 'No Articles Published Yet' })).toBeVisible();
  await page.goto('/admin/blogs');
  await page.getByRole('button', { name: 'Edit Article', exact: true }).click();
  await modal.getByRole('button', { name: 'Publish Settings', exact: true }).click();
  await modal.getByRole('button', { name: /Published Live & visible to all visitors/ }).click();
  await modal.getByRole('button', { name: 'Save Changes', exact: true }).click();
  await expect(modal).toHaveCount(0);
  expect(api.blogs[0].status).toBe('published');
  await page.goto('/blog');
  await expect(page.getByRole('heading', { name: 'Playwright private draft', exact: true })).toBeVisible();
});

test('public blog errors show retry instead of a false empty state', async ({ page, api }) => {
  api.blogError = true;
  await page.goto('/blog');
  await expect(page.getByRole('alert').filter({ hasText: 'Articles could not be loaded.' })).toBeVisible();
  api.blogError = false;
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'No Articles Published Yet' })).toBeVisible();
});
