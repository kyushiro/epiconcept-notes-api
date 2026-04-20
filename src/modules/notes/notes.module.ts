import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { NOTE_REPOSITORY_PORT } from './application/ports/note-repository.port';
import { NOTE_SERVICE_PORT } from './application/ports/note-service.port';
import { NoteService } from './application/use-cases/note.service';
import { NotesController } from './infrastructure/in/notes.controller';
import { NoteKyselyRepository } from './infrastructure/out/note-kysely.repository';

@Module({
  imports: [SharedModule],
  controllers: [NotesController],
  providers: [
    {
      provide: NOTE_REPOSITORY_PORT,
      useClass: NoteKyselyRepository,
    },
    {
      provide: NOTE_SERVICE_PORT,
      useClass: NoteService,
    },
  ],
})
export class NotesModule {}
