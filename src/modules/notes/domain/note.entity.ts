export interface Note {
  id: string;        // UUID v4
  tenantId: string;  // UUID v4
  authorId: string;  // UUID v4 — FK to users.id
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
