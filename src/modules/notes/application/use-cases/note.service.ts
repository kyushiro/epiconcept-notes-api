import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Note } from '../../domain/note.entity';
import {
  NOTE_REPOSITORY_PORT,
  NoteRepositoryPort,
} from '../ports/note-repository.port';
import {
  CreateNoteInput,
  NoteServicePort,
  UpdateNoteInput,
} from '../ports/note-service.port';

@Injectable()
export class NoteService implements NoteServicePort {
  constructor(
    @Inject(NOTE_REPOSITORY_PORT)
    private readonly noteRepo: NoteRepositoryPort,
  ) {}

  async create(input: CreateNoteInput): Promise<Note> {
    return this.noteRepo.create({
      id: uuidv4(),
      tenantId: input.tenantId,
      authorId: input.authorId,
      title: input.title,
      content: input.content,
    });
  }

  async findById(id: string, tenantId: string): Promise<Note> {
    const note = await this.noteRepo.findById(id, tenantId);
    if (!note) {
      throw new NotFoundException(`Note ${id} not found`);
    }
    return note;
  }

  async findAll(tenantId: string): Promise<Note[]> {
    return this.noteRepo.findAll(tenantId);
  }

  async update(
    id: string,
    tenantId: string,
    data: UpdateNoteInput,
  ): Promise<Note> {
    const updated = await this.noteRepo.update(id, tenantId, data);
    if (!updated) {
      throw new NotFoundException(`Note ${id} not found`);
    }
    return updated;
  }

  async delete(
    id: string,
    tenantId: string,
    requesterId: string,
    requesterRole: string,
  ): Promise<void> {
    const note = await this.noteRepo.findById(id, tenantId);
    if (!note) {
      throw new NotFoundException(`Note ${id} not found`);
    }

    if (requesterRole !== 'admin' && note.authorId !== requesterId) {
      throw new ForbiddenException('You do not have permission to delete this note');
    }

    await this.noteRepo.delete(id, tenantId);
  }
}
