import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Database } from '../../../../database/database.types';
import { KYSELY } from '../../../../database/database.module';
import { Note } from '../../domain/note.entity';
import { NoteRepositoryPort } from '../../application/ports/note-repository.port';

@Injectable()
export class NoteKyselyRepository implements NoteRepositoryPort {
  constructor(
    @Inject(KYSELY)
    private readonly db: Kysely<Database>,
  ) {}

  async findById(id: string, tenantId: string): Promise<Note | null> {
    const row = await this.db
      .selectFrom('notes')
      .selectAll()
      .where('id', '=', id)
      .where('tenant_id', '=', tenantId)
      .executeTakeFirst();

    return row ? this.toEntity(row) : null;
  }

  async findAll(tenantId: string): Promise<Note[]> {
    const rows = await this.db
      .selectFrom('notes')
      .selectAll()
      .where('tenant_id', '=', tenantId)
      .execute();

    return rows.map((r) => this.toEntity(r));
  }

  async create(note: Omit<Note, 'createdAt' | 'updatedAt'>): Promise<Note> {
    const now = new Date().toISOString();

    await this.db
      .insertInto('notes')
      .values({
        id: note.id,
        tenant_id: note.tenantId,
        author_id: note.authorId,
        title: note.title,
        content: note.content,
        created_at: now,
        updated_at: now,
      })
      .execute();

    const row = await this.db
      .selectFrom('notes')
      .selectAll()
      .where('id', '=', note.id)
      .where('tenant_id', '=', note.tenantId)
      .executeTakeFirstOrThrow();

    return this.toEntity(row);
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<Pick<Note, 'title' | 'content'>>,
  ): Promise<Note | null> {
    const now = new Date().toISOString();

    await this.db
      .updateTable('notes')
      .set({ ...this.toUpdateRow(data), updated_at: now })
      .where('id', '=', id)
      .where('tenant_id', '=', tenantId)
      .execute();

    return this.findById(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('notes')
      .where('id', '=', id)
      .where('tenant_id', '=', tenantId)
      .executeTakeFirst();

    return Number(result.numDeletedRows) > 0;
  }

  private toEntity(row: any): Note {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      authorId: row.author_id,
      title: row.title,
      content: row.content,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private toUpdateRow(data: Partial<Pick<Note, 'title' | 'content'>>) {
    const row: any = {};
    if (data.title !== undefined) row.title = data.title;
    if (data.content !== undefined) row.content = data.content;
    return row;
  }
}
