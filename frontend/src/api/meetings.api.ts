import { apiClient } from './client';
import type { Meeting, CreateMeetingInput, UpdateMeetingInput } from '../types';

export function list(): Promise<Meeting[]> {
  return apiClient.get<Meeting[]>('/meetings');
}

export function getById(id: string): Promise<Meeting> {
  return apiClient.get<Meeting>(`/meetings/${id}`);
}

export function create(data: CreateMeetingInput): Promise<Meeting> {
  return apiClient.post<Meeting>('/meetings', data);
}

export function update(id: string, data: UpdateMeetingInput): Promise<Meeting> {
  return apiClient.patch<Meeting>(`/meetings/${id}`, data);
}

export function remove(id: string): Promise<void> {
  return apiClient.delete<void>(`/meetings/${id}`);
}
