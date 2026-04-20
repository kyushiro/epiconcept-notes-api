import { apiClient } from './client';
import type { Note, CreateNoteInput, UpdateNoteInput } from '../types';

export function list(): Promise<Note[]> {
  return apiClient.get<Note[]>('/notes');
}

export function getById(id: string): Promise<Note> {
  return apiClient.get<Note>(`/notes/${id}`);
}

export function create(data: CreateNoteInput): Promise<Note> {
  return apiClient.post<Note>('/notes', data);
}

export function update(id: string, data: UpdateNoteInput): Promise<Note> {
  return apiClient.patch<Note>(`/notes/${id}`, data);
}

export function remove(id: string): Promise<void> {
  return apiClient.delete<void>(`/notes/${id}`);
}
