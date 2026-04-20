import { useState } from 'react';
import type { Meeting, UpdateMeetingInput } from '../types';
import { MeetingForm } from './MeetingForm';

interface MeetingCardProps {
  meeting: Meeting;
  onUpdate: (id: string, data: UpdateMeetingInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function MeetingCard({ meeting, onUpdate, onDelete }: MeetingCardProps) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(data: UpdateMeetingInput) {
    await onUpdate(meeting.id, data);
    setEditing(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete meeting "${meeting.title}"?`)) return;
    setDeleting(true);
    setError(null);
    try {
      await onDelete(meeting.id);
    } catch (err) {
      setError((err as Error).message);
      setDeleting(false);
    }
  }

  const start = new Date(meeting.startAt);
  const end = new Date(meeting.endAt);

  return (
    <div style={styles.card}>
      {error && <div style={styles.error}>{error}</div>}
      {editing ? (
        <MeetingForm
          initialData={meeting}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          submitLabel="Update"
        />
      ) : (
        <>
          <div style={styles.header}>
            <h3 style={styles.title}>{meeting.title}</h3>
            <div style={styles.actions}>
              <button onClick={() => setEditing(true)} style={styles.editBtn}>
                Edit
              </button>
              <button onClick={handleDelete} disabled={deleting} style={styles.deleteBtn}>
                {deleting ? '…' : 'Delete'}
              </button>
            </div>
          </div>
          <p style={styles.description}>{meeting.description}</p>
          <div style={styles.details}>
            <div style={styles.detail}>
              <span style={styles.detailLabel}>Start:</span>
              <span>{start.toLocaleString()}</span>
            </div>
            <div style={styles.detail}>
              <span style={styles.detailLabel}>End:</span>
              <span>{end.toLocaleString()}</span>
            </div>
            {meeting.location && (
              <div style={styles.detail}>
                <span style={styles.detailLabel}>Location:</span>
                <span>{meeting.location}</span>
              </div>
            )}
          </div>
          <div style={styles.meta}>
            <span>Created: {new Date(meeting.createdAt).toLocaleString()}</span>
          </div>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
  },
  editBtn: {
    padding: '4px 12px',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
  },
  deleteBtn: {
    padding: '4px 12px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
  },
  description: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.6',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '12px',
  },
  detail: {
    display: 'flex',
    gap: '8px',
    fontSize: '13px',
    color: '#334155',
  },
  detailLabel: {
    fontWeight: 600,
    color: '#64748b',
    minWidth: '60px',
  },
  meta: {
    fontSize: '11px',
    color: '#94a3b8',
  },
  error: {
    padding: '8px 12px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '8px',
  },
};
