import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto';

const TENANT_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const BASE_API = 'http://localhost:3001';

async function fillForm(page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never, opts: {
  tenantId?: string;
  email?: string;
  password?: string;
}) {
  if (opts.tenantId !== undefined) await page.getByTestId('tenant-id-input').fill(opts.tenantId);
  if (opts.email    !== undefined) await page.getByTestId('email-input').fill(opts.email);
  if (opts.password !== undefined) await page.getByTestId('password-input').fill(opts.password);
}

test.describe('Registration', () => {

  test('shows registration page', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading',
      { name: /register|sign up|create account/i }
    )).toBeVisible();
  });

  test('navigates to register from login page', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /register/i }).click();
    await expect(page).toHaveURL('/register');
  });

  test('registers a new user successfully', async ({ page }) => {
    const uniqueEmail = `test-${randomUUID()}@test.com`;

    await page.goto('/register');
    await fillForm(page, { tenantId: TENANT_ID, email: uniqueEmail, password: 'password123' });
    await page.getByTestId('submit-btn').click();

    await expect(page).toHaveURL(/\/(login|notes)/);
  });

  test('shows error for duplicate email', async ({ page }) => {
    await page.goto('/register');
    await fillForm(page, { tenantId: TENANT_ID, email: 'admin@test.com', password: 'password123' });
    await page.getByTestId('submit-btn').click();

    await expect(page.getByTestId('error-message')).toBeVisible();
    await expect(page.getByTestId('error-message')).toContainText(
      /already|conflict|taken|registered/i
    );
  });

  test('shows error for missing fields — stays on register', async ({ page }) => {
    await page.goto('/register');
    // Submit with no fields filled — HTML5 required validation blocks submission
    // and browser keeps user on the form page
    await page.getByTestId('submit-btn').click();
    await expect(page).toHaveURL('/register');
  });

  test('shows error for invalid email format — browser validates', async ({ page }) => {
    await page.goto('/register');
    await fillForm(page, { tenantId: TENANT_ID, email: 'not-an-email', password: 'password123' });
    await page.getByTestId('submit-btn').click();
    // type="email" + required triggers native browser validation — page stays
    await expect(page).toHaveURL('/register');
  });

  test('shows error for short password — browser validates', async ({ page }) => {
    await page.goto('/register');
    await fillForm(page, { tenantId: TENANT_ID, email: 'newuser@test.com', password: '123' });
    await page.getByTestId('submit-btn').click();
    // minLength={8} triggers native browser validation — page stays
    await expect(page).toHaveURL('/register');
  });

  test('API — register returns 201 with valid data', async ({ request }) => {
    const uniqueEmail = `api-test-${randomUUID()}@test.com`;

    const res = await request.post(`${BASE_API}/auth/register`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': TENANT_ID,
      },
      data: { email: uniqueEmail, password: 'password123' },
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    // Response shape: { accessToken, user: { id, email, role, tenantId, ... } }
    expect(body).toHaveProperty('accessToken');
    expect(body.user.email).toBe(uniqueEmail);
    expect(body.user).not.toHaveProperty('passwordHash');
    expect(body.user).not.toHaveProperty('password');
  });

  test('API — register returns 400 for missing tenant header', async ({ request }) => {
    const res = await request.post(`${BASE_API}/auth/register`, {
      headers: { 'Content-Type': 'application/json' },
      data: { email: 'test@test.com', password: 'password123' },
    });
    expect(res.status()).toBe(400);
  });

  test('API — register returns 409 for duplicate email', async ({ request }) => {
    const res = await request.post(`${BASE_API}/auth/register`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': TENANT_ID,
      },
      data: { email: 'admin@test.com', password: 'password123' },
    });
    expect(res.status()).toBe(409);
  });
});
