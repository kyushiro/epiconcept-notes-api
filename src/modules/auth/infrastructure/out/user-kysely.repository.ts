import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Database } from '../../../../database/database.types';
import { KYSELY } from '../../../../database/database.module';
import { User } from '../../domain/user.entity';
import { UserRepositoryPort } from '../../application/ports/user-repository.port';

@Injectable()
export class UserKyselyRepository implements UserRepositoryPort {
  constructor(
    @Inject(KYSELY)
    private readonly db: Kysely<Database>,
  ) {}

  async findById(id: string, tenantId: string): Promise<User | null> {
    const row = await this.db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .where('tenant_id', '=', tenantId)
      .executeTakeFirst();

    return row ? this.toEntity(row) : null;
  }

  async findByEmail(email: string, tenantId: string): Promise<User | null> {
    const row = await this.db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .where('tenant_id', '=', tenantId)
      .executeTakeFirst();

    return row ? this.toEntity(row) : null;
  }

  async create(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date().toISOString();

    await this.db
      .insertInto('users')
      .values({
        id: user.id,
        tenant_id: user.tenantId,
        email: user.email,
        password_hash: user.passwordHash,
        role: user.role,
        created_at: now,
        updated_at: now,
      })
      .execute();

    const row = await this.db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', user.id)
      .where('tenant_id', '=', user.tenantId)
      .executeTakeFirstOrThrow();

    return this.toEntity(row);
  }

  private toEntity(row: any): User {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
