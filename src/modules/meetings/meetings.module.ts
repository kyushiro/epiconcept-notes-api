import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { MEETING_REPOSITORY_PORT } from './application/ports/meeting-repository.port';
import { MEETING_SERVICE_PORT } from './application/ports/meeting-service.port';
import { MeetingService } from './application/use-cases/meeting.service';
import { MeetingsController } from './infrastructure/in/meetings.controller';
import { MeetingKyselyRepository } from './infrastructure/out/meeting-kysely.repository';

@Module({
  imports: [SharedModule],
  controllers: [MeetingsController],
  providers: [
    {
      provide: MEETING_REPOSITORY_PORT,
      useClass: MeetingKyselyRepository,
    },
    {
      provide: MEETING_SERVICE_PORT,
      useClass: MeetingService,
    },
  ],
})
export class MeetingsModule {}
