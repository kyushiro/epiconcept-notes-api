import {
  CompiledQuery,
  DatabaseConnection,
  Dialect,
  DialectAdapter,
  Driver,
  QueryResult,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
} from 'kysely';
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import * as fs from 'fs';
import * as path from 'path';

class SqlJsConnection implements DatabaseConnection {
  constructor(
    private readonly db: SqlJsDatabase,
    private readonly persist: () => void,
  ) {}

  async executeQuery<O>(compiledQuery: CompiledQuery): Promise<QueryResult<O>> {
    const { sql, parameters } = compiledQuery;
    const params = parameters as any[];
    const trimmed = sql.trim().toUpperCase();
    const isSelect =
      trimmed.startsWith('SELECT') ||
      trimmed.startsWith('WITH') ||
      trimmed.startsWith('PRAGMA');

    if (isSelect) {
      const stmt = this.db.prepare(sql);
      try {
        stmt.bind(params);
        const rows: O[] = [];
        while (stmt.step()) {
          rows.push(stmt.getAsObject() as unknown as O);
        }
        return { rows };
      } finally {
        stmt.free();
      }
    } else {
      const stmt = this.db.prepare(sql);
      try {
        stmt.run(params);
      } finally {
        stmt.free();
      }

      const metaStmt = this.db.prepare(
        'SELECT changes() as c, last_insert_rowid() as lastId',
      );
      let numAffectedRows = 0n;
      let insertId = 0n;
      try {
        if (metaStmt.step()) {
          const row = metaStmt.getAsObject();
          numAffectedRows = BigInt(row['c'] as number);
          insertId = BigInt(row['lastId'] as number);
        }
      } finally {
        metaStmt.free();
      }

      this.persist();

      return { rows: [], numAffectedRows, insertId };
    }
  }

  async *streamQuery<O>(): AsyncIterableIterator<QueryResult<O>> {
    throw new Error('sql.js dialect does not support streaming');
  }
}

class SqlJsDriver implements Driver {
  private db: SqlJsDatabase | null = null;
  private connection: SqlJsConnection | null = null;

  constructor(private readonly dbPath: string) {}

  async init(): Promise<void> {
    const sqlJsPath = path.dirname(require.resolve('sql.js'));
    const SQL = await initSqlJs({
      locateFile: (file: string) => path.join(sqlJsPath, file),
    });
    const fileBuffer = fs.existsSync(this.dbPath)
      ? fs.readFileSync(this.dbPath)
      : undefined;
    this.db = new SQL.Database(fileBuffer);
    this.db.run('PRAGMA foreign_keys = ON');
    this.connection = new SqlJsConnection(this.db, () => this.persist());
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    return this.connection!;
  }

  async beginTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('BEGIN'));
  }

  async commitTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('COMMIT'));
  }

  async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('ROLLBACK'));
  }

  async releaseConnection(_connection: DatabaseConnection): Promise<void> {
    // single shared connection — nothing to release
  }

  async destroy(): Promise<void> {
    if (this.db) {
      this.persist();
      this.db.close();
      this.db = null;
    }
  }

  private persist(): void {
    if (this.db && this.dbPath) {
      const data = this.db.export();
      fs.writeFileSync(this.dbPath, Buffer.from(data));
    }
  }
}

export class SqlJsDialect implements Dialect {
  constructor(private readonly dbPath: string) {}

  createAdapter(): DialectAdapter {
    return new SqliteAdapter();
  }

  createDriver(): Driver {
    return new SqlJsDriver(this.dbPath);
  }

  createIntrospector(db: any) {
    return new SqliteIntrospector(db);
  }

  createQueryCompiler() {
    return new SqliteQueryCompiler();
  }
}
