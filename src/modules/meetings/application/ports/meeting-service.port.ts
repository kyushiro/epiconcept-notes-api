import { Meeting } from '../../domain/meeting.entity';

export const MEETING_SERVICE_PORT = 'MEETING_SERVICE_PORT';

export interface CreateMeetingInput {
  tenantId: string;
  organizerId: string;
  title: string;
  description: string;
  startAt: Date;
  endAt: Date;
  location?: string;
}

export interface UpdateMeetingInput {
  title?: string;
  description?: string;
  startAt?: Date;
  endAt?: Date;
  location?: string | null;
}

export interface MeetingServicePort {
  create(input: CreateMeetingInput): Promise<Meeting>;
  findById(id: string, tenantId: string): Promise<Meeting>;
  findAll(tenantId: string): Promise<Meeting[]>;
  update(id: string, tenantId: string, data: UpdateMeetingInput): Promise<Meeting>;
  delete(id: string, tenantId: string): Promise<void>;
}
