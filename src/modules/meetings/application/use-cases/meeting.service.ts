import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Meeting } from '../../domain/meeting.entity';
import {
  MEETING_REPOSITORY_PORT,
  MeetingRepositoryPort,
} from '../ports/meeting-repository.port';
import {
  CreateMeetingInput,
  MeetingServicePort,
  UpdateMeetingInput,
} from '../ports/meeting-service.port';

@Injectable()
export class MeetingService implements MeetingServicePort {
  constructor(
    @Inject(MEETING_REPOSITORY_PORT)
    private readonly meetingRepo: MeetingRepositoryPort,
  ) {}

  async create(input: CreateMeetingInput): Promise<Meeting> {
    return this.meetingRepo.create({
      id: uuidv4(),
      tenantId: input.tenantId,
      organizerId: input.organizerId,
      title: input.title,
      description: input.description,
      startAt: input.startAt,
      endAt: input.endAt,
      location: input.location ?? null,
    });
  }

  async findById(id: string, tenantId: string): Promise<Meeting> {
    const meeting = await this.meetingRepo.findById(id, tenantId);
    if (!meeting) {
      throw new NotFoundException(`Meeting ${id} not found`);
    }
    return meeting;
  }

  async findAll(tenantId: string): Promise<Meeting[]> {
    return this.meetingRepo.findAll(tenantId);
  }

  async update(
    id: string,
    tenantId: string,
    data: UpdateMeetingInput,
  ): Promise<Meeting> {
    const updated = await this.meetingRepo.update(id, tenantId, data);
    if (!updated) {
      throw new NotFoundException(`Meeting ${id} not found`);
    }
    return updated;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const exists = await this.meetingRepo.findById(id, tenantId);
    if (!exists) {
      throw new NotFoundException(`Meeting ${id} not found`);
    }
    await this.meetingRepo.delete(id, tenantId);
  }
}
