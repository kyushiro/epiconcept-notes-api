import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Database } from '../../../../database/database.types';
import { KYSELY } from '../../../../database/database.module';
import { Meeting } from '../../domain/meeting.entity';
import { MeetingRepositoryPort } from '../../application/ports/meeting-repository.port';

@Injectable()
export class MeetingKyselyRepository implements MeetingRepositoryPort {
  constructor(
    @Inject(KYSELY)
    private readonly db: Kysely<Database>,
  ) {}

  async findById(id: string, tenantId: string): Promise<Meeting | null> {
    const row = await this.db
      .selectFrom('meetings')
      .selectAll()
      .where('id', '=', id)
      .where('tenant_id', '=', tenantId)
      .executeTakeFirst();

    return row ? this.toEntity(row) : null;
  }

  async findAll(tenantId: string): Promise<Meeting[]> {
    const rows = await this.db
      .selectFrom('meetings')
      .selectAll()
      .where('tenant_id', '=', tenantId)
      .execute();

    return rows.map((r) => this.toEntity(r));
  }

  async create(meeting: Omit<Meeting, 'createdAt' | 'updatedAt'>): Promise<Meeting> {
    const now = new Date().toISOString();

    await this.db
      .insertInto('meetings')
      .values({
        id: meeting.id,
        tenant_id: meeting.tenantId,
        organizer_id: meeting.organizerId,
        title: meeting.title,
        description: meeting.description,
        start_at: meeting.startAt.toISOString(),
        end_at: meeting.endAt.toISOString(),
        location: meeting.location,
        created_at: now,
        updated_at: now,
      })
      .execute();

    const row = await this.db
      .selectFrom('meetings')
      .selectAll()
      .where('id', '=', meeting.id)
      .where('tenant_id', '=', meeting.tenantId)
      .executeTakeFirstOrThrow();

    return this.toEntity(row);
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<Pick<Meeting, 'title' | 'description' | 'startAt' | 'endAt' | 'location'>>,
  ): Promise<Meeting | null> {
    const now = new Date().toISOString();

    await this.db
      .updateTable('meetings')
      .set({ ...this.toUpdateRow(data), updated_at: now })
      .where('id', '=', id)
      .where('tenant_id', '=', tenantId)
      .execute();

    return this.findById(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('meetings')
      .where('id', '=', id)
      .where('tenant_id', '=', tenantId)
      .executeTakeFirst();

    return Number(result.numDeletedRows) > 0;
  }

  private toEntity(row: any): Meeting {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      organizerId: row.organizer_id,
      title: row.title,
      description: row.description,
      startAt: new Date(row.start_at),
      endAt: new Date(row.end_at),
      location: row.location,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private toUpdateRow(data: Partial<Pick<Meeting, 'title' | 'description' | 'startAt' | 'endAt' | 'location'>>) {
    const row: any = {};
    if (data.title !== undefined) row.title = data.title;
    if (data.description !== undefined) row.description = data.description;
    if (data.startAt !== undefined) row.start_at = data.startAt.toISOString();
    if (data.endAt !== undefined) row.end_at = data.endAt.toISOString();
    if (data.location !== undefined) row.location = data.location;
    return row;
  }
}
