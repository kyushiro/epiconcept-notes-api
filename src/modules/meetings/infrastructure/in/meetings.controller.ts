import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../../../shared/guards/jwt.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { TenantId } from '../../../shared/decorators/tenant-id.decorator';
import {
  MEETING_SERVICE_PORT,
  MeetingServicePort,
} from '../../application/ports/meeting-service.port';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

@Controller('meetings')
@UseGuards(JwtGuard, RolesGuard)
export class MeetingsController {
  constructor(
    @Inject(MEETING_SERVICE_PORT)
    private readonly meetingService: MeetingServicePort,
  ) {}

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.meetingService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.meetingService.findById(id, tenantId);
  }

  @Post()
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateMeetingDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.meetingService.create({
      tenantId,
      organizerId: user.id,
      title: dto.title,
      description: dto.description,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
      location: dto.location,
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() dto: UpdateMeetingDto,
  ) {
    return this.meetingService.update(id, tenantId, {
      title: dto.title,
      description: dto.description,
      startAt: dto.startAt ? new Date(dto.startAt) : undefined,
      endAt: dto.endAt ? new Date(dto.endAt) : undefined,
      location: dto.location,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.meetingService.delete(id, tenantId);
    return { deleted: true };
  }
}
