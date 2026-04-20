import { Note } from '../../domain/note.entity';

export const NOTE_REPOSITORY_PORT = 'NOTE_REPOSITORY_PORT';

export interface NoteRepositoryPort {
  findById(id: string, tenantId: string): Promise<Note | null>;
  findAll(tenantId: string): Promise<Note[]>;
  create(note: Omit<Note, 'createdAt' | 'updatedAt'>): Promise<Note>;
  update(
    id: string,
    tenantId: string,
    data: Partial<Pick<Note, 'title' | 'content'>>,
  ): Promise<Note | null>;
  delete(id: string, tenantId: string): Promise<boolean>;
}
