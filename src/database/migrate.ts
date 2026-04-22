import { Kysely, Migrator, FileMigrationProvider } from 'kysely';
import { SqlJsDialect } from './sqljs-dialect';
import * as path from 'path';
import * as fs from 'fs/promises';
import { Database } from './database.types';

export async function runMigrations(): Promise<void> {
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

  await db.destroy();

  if (error) {
    throw new Error(`Migration failed: ${error}`);
  }

  console.log('All migrations completed.');
}

// CLI entrypoint
if (require.main === module) {
  runMigrations().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
