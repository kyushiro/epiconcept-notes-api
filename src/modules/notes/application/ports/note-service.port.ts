import { Note } from '../../domain/note.entity';

export const NOTE_SERVICE_PORT = 'NOTE_SERVICE_PORT';

export interface CreateNoteInput {
  tenantId: string;
  authorId: string;
  title: string;
  content: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
}

export interface NoteServicePort {
  create(input: CreateNoteInput): Promise<Note>;
  findById(id: string, tenantId: string): Promise<Note>;
  findAll(tenantId: string): Promise<Note[]>;
  update(id: string, tenantId: string, data: UpdateNoteInput): Promise<Note>;
  delete(id: string, tenantId: string, requesterId: string, requesterRole: string): Promise<void>;
}
