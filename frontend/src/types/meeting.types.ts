export interface Meeting {
  id: string;
  tenantId: string;
  organizerId: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  location: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingInput {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  location?: string;
}

export interface UpdateMeetingInput {
  title?: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  location?: string | null;
}
