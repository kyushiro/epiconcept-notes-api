import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // ── tenants ────────────────────────────────────────────────────────────────
  await db.schema
    .createTable('tenants')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) =>
      col.notNull().defaultTo(sql`(datetime('now'))`),
    )
    .execute();

  // ── users ──────────────────────────────────────────────────────────────────
  await db.schema
    .createTable('users')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('tenant_id', 'text', (col) =>
      col.notNull().references('tenants.id').onDelete('cascade'),
    )
    .addColumn('email', 'text', (col) => col.notNull())
    .addColumn('password_hash', 'text', (col) => col.notNull())
    .addColumn('role', 'text', (col) =>
      col
        .notNull()
        .defaultTo('user')
        .check(sql`role IN ('admin', 'user')`),
    )
    .addColumn('created_at', 'text', (col) =>
      col.notNull().defaultTo(sql`(datetime('now'))`),
    )
    .addColumn('updated_at', 'text', (col) =>
      col.notNull().defaultTo(sql`(datetime('now'))`),
    )
    .addUniqueConstraint('users_tenant_email_unique', ['tenant_id', 'email'])
    .execute();

  // ── notes ──────────────────────────────────────────────────────────────────
  await db.schema
    .createTable('notes')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('tenant_id', 'text', (col) =>
      col.notNull().references('tenants.id').onDelete('cascade'),
    )
    .addColumn('author_id', 'text', (col) =>
      col.notNull().references('users.id').onDelete('cascade'),
    )
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('content', 'text', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) =>
      col.notNull().defaultTo(sql`(datetime('now'))`),
    )
    .addColumn('updated_at', 'text', (col) =>
      col.notNull().defaultTo(sql`(datetime('now'))`),
    )
    .execute();

  await db.schema
    .createIndex('notes_tenant_idx')
    .ifNotExists()
    .on('notes')
    .column('tenant_id')
    .execute();

  // ── meetings ───────────────────────────────────────────────────────────────
  await db.schema
    .createTable('meetings')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('tenant_id', 'text', (col) =>
      col.notNull().references('tenants.id').onDelete('cascade'),
    )
    .addColumn('organizer_id', 'text', (col) =>
      col.notNull().references('users.id').onDelete('cascade'),
    )
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull())
    .addColumn('start_at', 'text', (col) => col.notNull())
    .addColumn('end_at', 'text', (col) => col.notNull())
    .addColumn('location', 'text')
    .addColumn('created_at', 'text', (col) =>
      col.notNull().defaultTo(sql`(datetime('now'))`),
    )
    .addColumn('updated_at', 'text', (col) =>
      col.notNull().defaultTo(sql`(datetime('now'))`),
    )
    .execute();

  await db.schema
    .createIndex('meetings_tenant_idx')
    .ifNotExists()
    .on('meetings')
    .column('tenant_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('meetings').ifExists().execute();
  await db.schema.dropTable('notes').ifExists().execute();
  await db.schema.dropTable('users').ifExists().execute();
  await db.schema.dropTable('tenants').ifExists().execute();
}
