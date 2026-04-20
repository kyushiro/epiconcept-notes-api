export interface Meeting {
  id: string;           // UUID v4
  tenantId: string;     // UUID v4
  organizerId: string;  // UUID v4 — FK to users.id
  title: string;
  description: string;
  startAt: Date;        // UTC ISO-8601
  endAt: Date;          // UTC ISO-8601
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
}
