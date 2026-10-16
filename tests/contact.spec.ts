import { test, expect, ready, noOverflow } from './fixtures/test';

const endpoint = /\/api\/leads\/contact(?:\?|$)/;
const fields = { name: 'Visitor Name', email: 'visitor@example.com', subject: 'Property enquiry', message: 'Please tell me more about the property.' };
const success = 'Message sent! Our team will get back to you soon.';
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
async function fillForm(page: import('@playwright/test').Page) {
  await page.goto('/contact');
  await ready(page, '#contact-name');
  await page.getByLabel('Full Name', { exact: true }).fill(fields.name);
  await page.getByLabel('Email Address', { exact: true }).fill(fields.email);
  await page.getByLabel('Subject', { exact: true }).fill(fields.subject);
  await page.getByLabel('Message', { exact: true }).fill(fields.message);
}

test('contact sends once, waits for the API and clears only after success', async ({ page }) => {
  test.setTimeout(90_000);
  let calls = 0, release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route(endpoint, async route => {
    if (route.request().method() === 'OPTIONS') { await route.fulfill({ status: 204, headers: cors }); return; }
    calls++;
    expect(route.request().postDataJSON()).toEqual(fields);
    await gate;
    await route.fulfill({ contentType: 'application/json', headers: cors, body: JSON.stringify({ success: true }) });
  });
  try {
    await fillForm(page);
    await page.getByRole('button', { name: 'Send Message', exact: true }).click();
    await expect.poll(() => calls).toBe(1);
    await expect(page.getByRole('button', { name: 'Processing...', exact: true })).toBeDisabled();
    await expect(page.getByLabel('Message', { exact: true })).toBeDisabled();
    await expect(page.getByText(success, { exact: true })).toHaveCount(0);
    await page.locator('form').evaluate(form => (form as HTMLFormElement).requestSubmit());
    expect(calls).toBe(1);
  } finally { release(); }
  await expect(page.getByText(success, { exact: true })).toBeVisible();
  for (const label of ['Full Name', 'Email Address', 'Subject', 'Message']) await expect(page.getByLabel(label, { exact: true })).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Send Message', exact: true })).toBeEnabled();
  await noOverflow(page);
});

for (const status of [503, 429]) {
  test(`contact ${status} preserves the message and permits a manual retry`, async ({ page }) => {
    let fail = true, calls = 0;
    const error = status === 429 ? 'Too many messages. Please try again after 15 minutes.' : 'Message could not be sent. Please try again or email seenuc2221@gmail.com.';
    await page.route(endpoint, async route => {
      if (route.request().method() === 'OPTIONS') { await route.fulfill({ status: 204, headers: cors }); return; }
      calls++;
      await route.fulfill({ status: fail ? status : 200, contentType: 'application/json', headers: cors, body: JSON.stringify(fail ? { success: false, message: error } : { success: true }) });
    });
    await fillForm(page);
    await page.getByRole('button', { name: 'Send Message', exact: true }).click();
    await expect(page.getByText(error, { exact: true })).toBeVisible();
    await expect(page.getByLabel('Message', { exact: true })).toHaveValue(fields.message);
    await expect(page.getByText(success, { exact: true })).toHaveCount(0);
    expect(calls).toBe(1);
    fail = false;
    await page.getByRole('button', { name: 'Send Message', exact: true }).click();
    await expect(page.getByText(success, { exact: true })).toBeVisible();
    expect(calls).toBe(2);
  });
}

test('blank contact fields never submit an email request', async ({ page }) => {
  let calls = 0;
  await page.route(endpoint, async route => { calls++; await route.fulfill({ status: 500, headers: cors, body: '{}' }); });
  await fillForm(page);
  await page.getByLabel('Full Name', { exact: true }).fill('   ');
  await page.getByRole('button', { name: 'Send Message', exact: true }).click();
  await expect(page.getByText('Please fill in all fields.', { exact: true })).toBeVisible();
  expect(calls).toBe(0);
});
