import { Kysely } from 'kysely';
import { SqlJsDialect } from './sqljs-dialect';
import { Database } from './database.types';
import * as bcrypt from 'bcrypt';

const TENANT_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const ADMIN_ID  = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const USER_ID   = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

async function seed(): Promise<void> {
  const dbPath = process.env.DATABASE_PATH ?? './db.sqlite';
  const db = new Kysely<Database>({ dialect: new SqlJsDialect(dbPath) });

  const now = new Date().toISOString();

  await db
    .insertInto('tenants')
    .values({ id: TENANT_ID, name: 'Test Tenant', created_at: now })
    .onConflict((oc) => oc.column('id').doNothing())
    .execute();

  const adminHash = await bcrypt.hash('password123', 10);
  const userHash  = await bcrypt.hash('password123', 10);

  await db
    .insertInto('users')
    .values([
      {
        id: ADMIN_ID,
        tenant_id: TENANT_ID,
        email: 'admin@test.com',
        password_hash: adminHash,
        role: 'admin',
        created_at: now,
        updated_at: now,
      },
      {
        id: USER_ID,
        tenant_id: TENANT_ID,
        email: 'user@test.com',
        password_hash: userHash,
        role: 'user',
        created_at: now,
        updated_at: now,
      },
    ])
    .onConflict((oc) => oc.columns(['tenant_id', 'email']).doNothing())
    .execute();

  await db.destroy();

  console.log('Seed complete.');
  console.log(`Tenant ID : ${TENANT_ID}`);
  console.log('Users     : admin@test.com / user@test.com  (password: password123)');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
