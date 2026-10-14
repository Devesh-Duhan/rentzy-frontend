import { test, expect, ready, signIn, noOverflow } from './fixtures/test';

test('anonymous protected pages redirect to login with the return path', async ({ page }) => {
  for (const path of ['/admin/blogs', '/seller', '/profile']) {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(`/login\\?next=${encodeURIComponent(path)}$`));
  }
});

test('buyer cannot enter seller or admin panels', async ({ page, context, baseURL }) => {
  await signIn(context, baseURL!);
  for (const path of ['/admin/blogs', '/seller']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/?\?error=unauthorized$/);
  }
});

test('login validates required fields and persists the signed-in user', async ({ page, api }) => {
  await page.goto('/login');
  await ready(page, 'input[type="email"]');
  await page.locator('button[type="submit"]').click();
  expect(api.calls.some(call => call.path === '/auth/login')).toBe(false);
  await page.getByPlaceholder('you@example.com').fill('buyer@example.test');
  await page.getByPlaceholder('Enter your password').fill('TestPassword123!');
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('user') || '{}').role)).toBe('buyer');
  expect(await page.context().cookies()).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'rentzy_token' })]));
});

test('invalid credentials show an error without leaving login', async ({ page }) => {
  await page.goto('/login');
  await ready(page, 'input[type="email"]');
  await page.getByPlaceholder('you@example.com').fill('buyer@example.test');
  await page.getByPlaceholder('Enter your password').fill('WrongPassword');
  await page.locator('button[type="submit"]').click();
  await expect(page.getByText('Invalid email or password.', { exact: true }).first()).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

async function fillRegistration(page: import('@playwright/test').Page) {
  await page.goto('/register');
  await ready(page, '#name');
  await page.locator('#name').fill('Test buyer');
  await page.locator('#email').fill('buyer@example.test');
  await page.locator('#password').fill('TestPassword123!');
  await page.locator('#terms').check();
  await page.getByRole('button', { name: 'Send OTP', exact: true }).click();
}

test('signup sends OTP, rejects a wrong code and completes with a valid code', async ({ page, api }) => {
  await fillRegistration(page);
  await expect(page.locator('#otp')).toBeVisible();
  await page.locator('#otp').fill('000000');
  await page.getByRole('button', { name: 'Verify & Create Account', exact: true }).click();
  await expect(page.getByText('Invalid OTP.', { exact: true }).first()).toBeVisible();
  await page.locator('#otp').fill('123456');
  await page.getByRole('button', { name: 'Verify & Create Account', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(api.calls.filter(call => call.path === '/auth/register-otp')).toHaveLength(1);
  expect(api.calls.filter(call => call.path === '/auth/verify-register-otp')).toHaveLength(2);
});

test('OTP service failure keeps registration editable', async ({ page, api }) => {
  api.otpError = true;
  await fillRegistration(page);
  await expect(page.getByText('Email service unavailable. Try again.', { exact: true }).first()).toBeVisible();
  await expect(page.locator('#email')).toBeEditable();
  await expect(page.locator('#otp')).toHaveCount(0);
  await noOverflow(page);
});
