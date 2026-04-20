import { test, expect, Page } from '@playwright/test';

const TENANT_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const ADMIN_EMAIL = 'admin@test.com';
const PASSWORD = 'password123';

async function clearAuth(page: Page) {
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('login with valid credentials redirects to /notes', async ({ page }) => {
    await page.getByTestId('tenant-id-input').fill(TENANT_ID);
    await page.getByTestId('email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('password-input').fill(PASSWORD);
    await page.getByTestId('submit-btn').click();

    await expect(page).toHaveURL('/notes');
    await expect(page.getByTestId('user-email')).toContainText(ADMIN_EMAIL);
  });

  test('login with wrong password shows error message', async ({ page }) => {
    await page.getByTestId('tenant-id-input').fill(TENANT_ID);
    await page.getByTestId('email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('password-input').fill('wrongpassword99');
    await page.getByTestId('submit-btn').click();

    await expect(page.getByTestId('error-message')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('login with wrong tenant shows error message', async ({ page }) => {
    await page.getByTestId('tenant-id-input').fill('ffffffff-ffff-ffff-ffff-ffffffffffff');
    await page.getByTestId('email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('password-input').fill(PASSWORD);
    await page.getByTestId('submit-btn').click();

    await expect(page.getByTestId('error-message')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('logout redirects to /login', async ({ page }) => {
    await page.getByTestId('tenant-id-input').fill(TENANT_ID);
    await page.getByTestId('email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('password-input').fill(PASSWORD);
    await page.getByTestId('submit-btn').click();
    await expect(page).toHaveURL('/notes');

    await page.getByTestId('logout-btn').click();
    await expect(page).toHaveURL('/login');
  });

  test('already-logged-in user is redirected from /login to /notes', async ({ page }) => {
    await page.getByTestId('tenant-id-input').fill(TENANT_ID);
    await page.getByTestId('email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('password-input').fill(PASSWORD);
    await page.getByTestId('submit-btn').click();
    await expect(page).toHaveURL('/notes');

    await page.goto('/login');
    await expect(page).toHaveURL('/notes');
  });

  test('unauthenticated access to /notes redirects to /login', async ({ page }) => {
    await page.goto('/notes');
    await expect(page).toHaveURL('/login');
  });

  test('unauthenticated access to /meetings redirects to /login', async ({ page }) => {
    await page.goto('/meetings');
    await expect(page).toHaveURL('/login');
  });
});
