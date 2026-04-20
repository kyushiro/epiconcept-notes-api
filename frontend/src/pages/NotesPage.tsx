import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotes } from '../hooks/useNotes';
import { NoteCard } from '../components/NoteCard';
import { NoteForm } from '../components/NoteForm';
import type { CreateNoteInput, UpdateNoteInput } from '../types';

export function NotesPage() {
  const { user } = useAuth();
  const { notes, loading, error, createNote, updateNote, deleteNote } = useNotes();
  const [showCreate, setShowCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  async function handleCreate(data: CreateNoteInput | UpdateNoteInput) {
    setCreateError(null);
    try {
      await createNote(data as CreateNoteInput);
      setShowCreate(false);
    } catch (err) {
      setCreateError((err as Error).message);
      throw err; // re-throw so NoteForm shows the error too
    }
  }

  async function handleUpdate(id: string, data: UpdateNoteInput) {
    await updateNote(id, data);
  }

  async function handleDelete(id: string) {
    await deleteNote(id);
  }

  return (
    <div data-testid="notes-page" style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.heading}>Notes</h2>
        <button data-testid="new-note-btn" onClick={() => setShowCreate((v) => !v)} style={styles.newBtn}>
          {showCreate ? 'Cancel' : '+ New Note'}
        </button>
      </div>

      {showCreate && (
        <div data-testid="create-panel" style={styles.createPanel}>
          <h3 style={styles.panelHeading}>Create Note</h3>
          {createError && <div style={styles.error}>{createError}</div>}
          <NoteForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            submitLabel="Create Note"
          />
        </div>
      )}

      {loading && <div data-testid="loading-indicator" style={styles.status}>Loading notes…</div>}
      {error && <div data-testid="error-banner" style={styles.errorBanner}>{error}</div>}

      {!loading && !error && notes.length === 0 && (
        <div data-testid="empty-state" style={styles.empty}>No notes yet. Create your first note above.</div>
      )}

      <div data-testid="notes-list" style={styles.list}>
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            isAdmin={isAdmin}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {!isAdmin && notes.length > 0 && (
        <p style={styles.hint}>Note: only admins can delete notes.</p>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px 16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  heading: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 700,
    color: '#1e293b',
  },
  newBtn: {
    padding: '8px 18px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
  },
  createPanel: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  panelHeading: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#334155',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  status: {
    color: '#64748b',
    fontSize: '14px',
    padding: '20px 0',
    textAlign: 'center',
  },
  empty: {
    color: '#94a3b8',
    fontSize: '14px',
    padding: '40px 0',
    textAlign: 'center',
  },
  errorBanner: {
    padding: '10px 14px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  error: {
    padding: '8px 12px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '12px',
  },
  hint: {
    marginTop: '16px',
    fontSize: '12px',
    color: '#94a3b8',
    textAlign: 'center',
  },
};
