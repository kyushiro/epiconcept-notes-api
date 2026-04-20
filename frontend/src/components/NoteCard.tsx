import { useState } from 'react';
import type { Note, UpdateNoteInput } from '../types';
import { NoteForm } from './NoteForm';

interface NoteCardProps {
  note: Note;
  isAdmin: boolean;
  onUpdate: (id: string, data: UpdateNoteInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function NoteCard({ note, isAdmin, onUpdate, onDelete }: NoteCardProps) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(data: UpdateNoteInput) {
    await onUpdate(note.id, data);
    setEditing(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete note "${note.title}"?`)) return;
    setDeleting(true);
    setError(null);
    try {
      await onDelete(note.id);
    } catch (err) {
      setError((err as Error).message);
      setDeleting(false);
    }
  }

  return (
    <div data-testid="note-card" style={styles.card}>
      {error && <div data-testid="note-error" style={styles.error}>{error}</div>}
      {editing ? (
        <NoteForm
          initialData={note}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          submitLabel="Update"
        />
      ) : (
        <>
          <div style={styles.header}>
            <h3 data-testid="note-title" style={styles.title}>{note.title}</h3>
            <div style={styles.actions}>
              <button data-testid="edit-btn" onClick={() => setEditing(true)} style={styles.editBtn}>
                Edit
              </button>
              <button
                data-testid="delete-btn"
                onClick={handleDelete}
                disabled={deleting || !isAdmin}
                style={{
                  ...styles.deleteBtn,
                  opacity: !isAdmin ? 0.5 : 1,
                }}
                title={!isAdmin ? 'Admin only' : 'Delete note'}
              >
                {deleting ? '…' : 'Delete'}
              </button>
            </div>
          </div>
          <p data-testid="note-content" style={styles.content}>{note.content}</p>
          <div style={styles.meta}>
            <span>Created: {new Date(note.createdAt).toLocaleString()}</span>
            <span>Updated: {new Date(note.updatedAt).toLocaleString()}</span>
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
  content: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    color: '#475569',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.6',
  },
  meta: {
    display: 'flex',
    gap: '16px',
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
