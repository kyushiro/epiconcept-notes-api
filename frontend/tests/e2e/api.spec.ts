import { test, expect, request as apiRequest } from '@playwright/test';

const BASE = 'http://localhost:3001';
const TENANT_1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const TENANT_2 = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
const ADMIN_EMAIL = 'admin@test.com';
const USER_EMAIL = 'user@test.com';
const PASSWORD = 'password123';

// Helper: create a request context with explicit headers
async function ctx(tenantId?: string, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (tenantId) headers['X-Tenant-Id'] = tenantId;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return apiRequest.newContext({ baseURL: BASE, extraHTTPHeaders: headers });
}

test.describe('API — Missing X-Tenant-Id header', () => {
  test('POST /auth/login without X-Tenant-Id returns 400', async () => {
    const c = await ctx();
    const res = await c.post('/auth/login', {
      data: { email: ADMIN_EMAIL, password: PASSWORD },
    });
    expect(res.status()).toBe(400);
    await c.dispose();
  });

  test('GET /notes without X-Tenant-Id returns 400', async () => {
    // Obtain a token first (with a valid tenant)
    const authCtx = await ctx(TENANT_1);
    const loginRes = await authCtx.post('/auth/login', {
      data: { email: ADMIN_EMAIL, password: PASSWORD },
    });
    const { accessToken } = await loginRes.json();
    await authCtx.dispose();

    const noTenantCtx = await ctx(undefined, accessToken);
    const res = await noTenantCtx.get('/notes');
    expect(res.status()).toBe(400);
    await noTenantCtx.dispose();
  });
});

test.describe('API — Auth endpoints', () => {
  test('POST /auth/login returns accessToken and user object', async () => {
    const c = await ctx(TENANT_1);
    const res = await c.post('/auth/login', {
      data: { email: ADMIN_EMAIL, password: PASSWORD },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty('accessToken');
    expect(body.user.email).toBe(ADMIN_EMAIL);
    expect(body.user.role).toBe('admin');
    expect(body.user).not.toHaveProperty('passwordHash');
    await c.dispose();
  });

  test('POST /auth/login with bad credentials returns 401', async () => {
    const c = await ctx(TENANT_1);
    const res = await c.post('/auth/login', {
      data: { email: ADMIN_EMAIL, password: 'badpassword' },
    });
    expect(res.status()).toBe(401);
    await c.dispose();
  });
});

test.describe('API — Notes CRUD, tenant scoping & RBAC', () => {
  let adminToken: string;
  let userToken: string;
  let noteId: string;

  test.beforeAll(async () => {
    // Login admin
    const adminCtx = await ctx(TENANT_1);
    const adminRes = await adminCtx.post('/auth/login', {
      data: { email: ADMIN_EMAIL, password: PASSWORD },
    });
    adminToken = (await adminRes.json()).accessToken;
    await adminCtx.dispose();

    // Login user
    const userCtx = await ctx(TENANT_1);
    const userRes = await userCtx.post('/auth/login', {
      data: { email: USER_EMAIL, password: PASSWORD },
    });
    userToken = (await userRes.json()).accessToken;
    await userCtx.dispose();

    // Pre-create a note owned by admin for delete tests
    const noteCtx = await ctx(TENANT_1, adminToken);
    const noteRes = await noteCtx.post('/notes', {
      data: { title: 'API RBAC Test Note', content: 'Used in delete tests' },
    });
    expect(noteRes.status()).toBe(201);
    noteId = (await noteRes.json()).id;
    await noteCtx.dispose();
  });

  test('GET /notes returns only notes scoped to the request tenant', async () => {
    const c = await ctx(TENANT_1, adminToken);
    const res = await c.get('/notes');
    expect(res.status()).toBe(200);
    const notes = await res.json();
    expect(Array.isArray(notes)).toBe(true);
    notes.forEach((n: { tenantId: string }) =>
      expect(n.tenantId).toBe(TENANT_1),
    );
    await c.dispose();
  });

  test('POST /notes creates note with correct tenantId', async () => {
    const c = await ctx(TENANT_1, adminToken);
    const res = await c.post('/notes', {
      data: { title: 'Scoped Note', content: 'Should be tenant-1 scoped' },
    });
    expect(res.status()).toBe(201);
    const note = await res.json();
    expect(note.tenantId).toBe(TENANT_1);
    expect(note.title).toBe('Scoped Note');
    await c.dispose();
  });

  test('Tenant isolation: TENANT_1 notes are not visible under TENANT_2 header', async () => {
    const c = await ctx(TENANT_2, adminToken);
    const res = await c.get('/notes');
    // 200 with empty list, not the notes from TENANT_1
    expect(res.status()).toBe(200);
    const notes = await res.json();
    const leaked = notes.filter((n: { tenantId: string }) => n.tenantId === TENANT_1);
    expect(leaked).toHaveLength(0);
    await c.dispose();
  });

  test('PATCH /notes/:id updates the note', async () => {
    const c = await ctx(TENANT_1, adminToken);
    const res = await c.patch(`/notes/${noteId}`, {
      data: { title: 'API RBAC Test Note — Updated' },
    });
    expect(res.status()).toBe(200);
    const note = await res.json();
    expect(note.title).toBe('API RBAC Test Note — Updated');
    await c.dispose();
  });

  test('DELETE /notes/:id returns 403 for user role', async () => {
    const c = await ctx(TENANT_1, userToken);
    const res = await c.delete(`/notes/${noteId}`);
    expect(res.status()).toBe(403);
    await c.dispose();
  });

  test('DELETE /notes/:id succeeds for admin role', async () => {
    const c = await ctx(TENANT_1, adminToken);
    const res = await c.delete(`/notes/${noteId}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.deleted).toBe(true);
    await c.dispose();
  });

  test('GET /notes/:id returns 404 after deletion', async () => {
    const c = await ctx(TENANT_1, adminToken);
    const res = await c.get(`/notes/${noteId}`);
    expect(res.status()).toBe(404);
    await c.dispose();
  });
});
