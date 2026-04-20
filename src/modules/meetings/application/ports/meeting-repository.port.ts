import { Meeting } from '../../domain/meeting.entity';

export const MEETING_REPOSITORY_PORT = 'MEETING_REPOSITORY_PORT';

export interface MeetingRepositoryPort {
  findById(id: string, tenantId: string): Promise<Meeting | null>;
  findAll(tenantId: string): Promise<Meeting[]>;
  create(meeting: Omit<Meeting, 'createdAt' | 'updatedAt'>): Promise<Meeting>;
  update(
    id: string,
    tenantId: string,
    data: Partial<Pick<Meeting, 'title' | 'description' | 'startAt' | 'endAt' | 'location'>>,
  ): Promise<Meeting | null>;
  delete(id: string, tenantId: string): Promise<boolean>;
}
