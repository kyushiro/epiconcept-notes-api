import { Global, Module } from '@nestjs/common';
import { Kysely } from 'kysely';
import { SqlJsDialect } from './sqljs-dialect';
import { Database } from './database.types';

export const KYSELY = 'KYSELY';

const kyselyProvider = {
  provide: KYSELY,
  useFactory: (): Kysely<Database> => {
    const dbPath = process.env.DATABASE_PATH ?? './db.sqlite';
    return new Kysely<Database>({ dialect: new SqlJsDialect(dbPath) });
  },
};

@Global()
@Module({
  providers: [kyselyProvider],
  exports: [kyselyProvider],
})
export class DatabaseModule {}
