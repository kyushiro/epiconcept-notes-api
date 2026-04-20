import { test, expect, Page } from '@playwright/test';

const TENANT_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const ADMIN_EMAIL = 'admin@test.com';
const USER_EMAIL = 'user@test.com';
const PASSWORD = 'password123';

async function login(page: Page, email: string, tenantId = TENANT_ID) {
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByTestId('tenant-id-input').fill(tenantId);
  await page.getByTestId('email-input').fill(email);
  await page.getByTestId('password-input').fill(PASSWORD);
  await page.getByTestId('submit-btn').click();
  await expect(page).toHaveURL('/notes');
}

test.describe('Notes — CRUD', () => {
  test('admin can create a note', async ({ page }) => {
    await login(page, ADMIN_EMAIL);

    await page.getByTestId('new-note-btn').click();
    await expect(page.getByTestId('create-panel')).toBeVisible();

    const title = `Create Test ${Date.now()}`;
    await page.getByTestId('note-title-input').fill(title);
    await page.getByTestId('note-content-input').fill('Content for create test');
    await page.getByTestId('note-submit-btn').click();

    await expect(page.getByTestId('notes-list')).toContainText(title);
  });

  test('admin can edit a note', async ({ page }) => {
    await login(page, ADMIN_EMAIL);

    await page.getByTestId('new-note-btn').click();
    const originalTitle = `Edit Original ${Date.now()}`;
    await page.getByTestId('note-title-input').fill(originalTitle);
    await page.getByTestId('note-content-input').fill('Original content');
    await page.getByTestId('note-submit-btn').click();
    await expect(page.getByTestId('notes-list')).toContainText(originalTitle);

    // Find the card by visible title text, then click its Edit button
    const noteCard = page.getByTestId('note-card').filter({ hasText: originalTitle });
    await noteCard.getByTestId('edit-btn').click();

    // After clicking edit the title moves into an input — hasText filter no longer matches.
    // Scope to the card by position (first card in the list, since new notes are prepended).
    const editingCard = page.getByTestId('note-card').first();
    const updatedTitle = `Edit Updated ${Date.now()}`;
    await editingCard.getByTestId('note-title-input').fill(updatedTitle);
    await editingCard.getByTestId('note-submit-btn').click();

    await expect(page.getByTestId('notes-list')).toContainText(updatedTitle);
    await expect(page.getByTestId('notes-list')).not.toContainText(originalTitle);
  });

  test('admin can delete a note', async ({ page }) => {
    await login(page, ADMIN_EMAIL);

    await page.getByTestId('new-note-btn').click();
    const title = `Delete Me ${Date.now()}`;
    await page.getByTestId('note-title-input').fill(title);
    await page.getByTestId('note-content-input').fill('To be deleted');
    await page.getByTestId('note-submit-btn').click();

    const noteCard = page.getByTestId('note-card').filter({ hasText: title });
    await expect(noteCard).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await noteCard.getByTestId('delete-btn').click();

    await expect(page.getByTestId('notes-list')).not.toContainText(title);
  });

  test('user role sees notes but delete button is disabled', async ({ page }) => {
    // Create a note as admin first
    await login(page, ADMIN_EMAIL);
    await page.getByTestId('new-note-btn').click();
    const title = `User Cannot Delete ${Date.now()}`;
    await page.getByTestId('note-title-input').fill(title);
    await page.getByTestId('note-content-input').fill('Protected note');
    await page.getByTestId('note-submit-btn').click();
    await expect(page.getByTestId('notes-list')).toContainText(title);

    // Login as user
    await login(page, USER_EMAIL);

    const noteCard = page.getByTestId('note-card').filter({ hasText: title });
    await expect(noteCard).toBeVisible();

    // Delete button must be disabled for non-admin
    const deleteBtn = noteCard.getByTestId('delete-btn');
    await expect(deleteBtn).toBeDisabled();
    await expect(deleteBtn).toHaveAttribute('title', 'Admin only');
  });

  test('user can create and edit their own notes', async ({ page }) => {
    await login(page, USER_EMAIL);

    await page.getByTestId('new-note-btn').click();
    const title = `User Note ${Date.now()}`;
    await page.getByTestId('note-title-input').fill(title);
    await page.getByTestId('note-content-input').fill('User created content');
    await page.getByTestId('note-submit-btn').click();
    await expect(page.getByTestId('notes-list')).toContainText(title);

    const noteCard = page.getByTestId('note-card').filter({ hasText: title });
    await noteCard.getByTestId('edit-btn').click();

    // After clicking edit the title moves into an input — use first() as the newly-created
    // note is prepended to the list and is the first card.
    const editingCard = page.getByTestId('note-card').first();
    const updated = `User Note Updated ${Date.now()}`;
    await editingCard.getByTestId('note-title-input').fill(updated);
    await editingCard.getByTestId('note-submit-btn').click();
    await expect(page.getByTestId('notes-list')).toContainText(updated);
  });
});

test.describe('Notes — Tenant isolation', () => {
  test('notes from a different tenant are not visible', async ({ page }) => {
    // Login as admin on TENANT_1 and create a note
    await login(page, ADMIN_EMAIL, TENANT_ID);
    await page.getByTestId('new-note-btn').click();
    const title = `Tenant1 Isolation ${Date.now()}`;
    await page.getByTestId('note-title-input').fill(title);
    await page.getByTestId('note-content-input').fill('Only for tenant 1');
    await page.getByTestId('note-submit-btn').click();
    await expect(page.getByTestId('notes-list')).toContainText(title);

    // Attempt login with a different tenant (no users there → auth fails)
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByTestId('tenant-id-input').fill('ffffffff-ffff-ffff-ffff-ffffffffffff');
    await page.getByTestId('email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('password-input').fill(PASSWORD);
    await page.getByTestId('submit-btn').click();

    // Login must fail — user is unknown in the other tenant
    await expect(page.getByTestId('error-message')).toBeVisible();
    // The note from TENANT_1 is not accessible
    await expect(page).toHaveURL('/login');
  });
});
