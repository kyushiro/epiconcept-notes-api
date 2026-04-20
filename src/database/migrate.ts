import { Kysely, Migrator, FileMigrationProvider } from 'kysely';
import { SqlJsDialect } from './sqljs-dialect';
import * as path from 'path';
import * as fs from 'fs/promises';
import { Database } from './database.types';

async function migrate(): Promise<void> {
  const dbPath = process.env.DATABASE_PATH ?? './db.sqlite';

  const db = new Kysely<Database>({
    dialect: new SqlJsDialect(dbPath),
  });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, 'migrations'),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  if (results) {
    for (const result of results) {
      if (result.status === 'Success') {
        console.log(`Migration "${result.migrationName}" ran successfully.`);
      } else if (result.status === 'Error') {
        console.error(`Migration "${result.migrationName}" failed.`);
      }
    }
  }

  if (error) {
    console.error('Migration failed:', error);
    await db.destroy();
    process.exit(1);
  }

  await db.destroy();
  console.log('All migrations completed.');
}

migrate();
