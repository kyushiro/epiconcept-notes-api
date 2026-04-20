import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TENANT_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:5174',
    // X-Tenant-Id is set per-request in api.spec.ts; do not set a global override
    // as it would interfere with browser-based auth tests that fill the tenant from the form.
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'node scripts/start-test-server.js',
      cwd: ROOT,
      port: 3001,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'npm run dev -- --config vite.e2e.config.ts',
      port: 5174,
      reuseExistingServer: false,
    },
  ],
});
