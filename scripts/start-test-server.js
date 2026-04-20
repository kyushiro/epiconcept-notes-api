/**
 * Cross-platform script to prepare and start the e2e test backend.
 * Sets DATABASE_PATH=./db-test.sqlite and PORT=3001 for all child processes.
 */
const { execSync, spawn } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const env = {
  ...process.env,
  DATABASE_PATH: path.join(ROOT, 'db-test.sqlite'),
  PORT: '3001',
  JWT_SECRET: process.env.JWT_SECRET || 'e2e-test-secret-key',
};

const run = (cmd) => execSync(cmd, { cwd: ROOT, stdio: 'inherit', env });

console.log('[e2e] Running migrations on db-test.sqlite...');
run('npm run migration:run');

console.log('[e2e] Seeding db-test.sqlite...');
run('npm run db:seed');

console.log('[e2e] Starting backend on port 3001...');
const server = spawn('npm', ['run', 'start:dev'], {
  cwd: ROOT,
  stdio: 'inherit',
  env,
  shell: true,
});

server.on('error', (err) => {
  console.error('[e2e] Server start error:', err);
  process.exit(1);
});
