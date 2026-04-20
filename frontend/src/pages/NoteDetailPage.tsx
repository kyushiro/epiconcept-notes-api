import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as notesApi from '../api/notes.api';
import type { Note, UpdateNoteInput } from '../types';
import { NoteForm } from '../components/NoteForm';
import { useAuth } from '../contexts/AuthContext';

export function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    notesApi
      .getById(id)
      .then((data) => {
        setNote(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  async function handleUpdate(data: UpdateNoteInput) {
    if (!id) return;
    const updated = await notesApi.update(id, data);
    setNote(updated);
    setEditing(false);
  }

  async function handleDelete() {
    if (!id || !note) return;
    if (!confirm(`Delete note "${note.title}"?`)) return;
    await notesApi.remove(id);
    navigate('/notes');
  }

  if (loading) return <div style={styles.status}>Loading…</div>;
  if (error) return <div style={styles.errorBanner}>{error}</div>;
  if (!note) return null;

  return (
    <div style={styles.page}>
      <Link to="/notes" style={styles.back}>
        ← Back to Notes
      </Link>

      {editing ? (
        <div style={styles.editPanel}>
          <h2 style={styles.heading}>Edit Note</h2>
          <NoteForm
            initialData={note}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
            submitLabel="Update Note"
          />
        </div>
      ) : (
        <div style={styles.card}>
          <div style={styles.header}>
            <h2 style={styles.title}>{note.title}</h2>
            <div style={styles.actions}>
              <button onClick={() => setEditing(true)} style={styles.editBtn}>
                Edit
              </button>
              {isAdmin && (
                <button onClick={handleDelete} style={styles.deleteBtn}>
                  Delete
                </button>
              )}
            </div>
          </div>
          <p style={styles.content}>{note.content}</p>
          <div style={styles.meta}>
            <span>Created: {new Date(note.createdAt).toLocaleString()}</span>
            <span>Updated: {new Date(note.updatedAt).toLocaleString()}</span>
          </div>
        </div>
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
  back: {
    display: 'inline-block',
    marginBottom: '20px',
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
  },
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  editPanel: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  heading: {
    margin: '0 0 16px 0',
    fontSize: '20px',
    fontWeight: 700,
    color: '#1e293b',
  },
  title: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 700,
    color: '#1e293b',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
  },
  editBtn: {
    padding: '6px 14px',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
  },
  deleteBtn: {
    padding: '6px 14px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
  },
  content: {
    fontSize: '15px',
    color: '#334155',
    lineHeight: '1.7',
    whiteSpace: 'pre-wrap',
    marginBottom: '20px',
  },
  meta: {
    display: 'flex',
    gap: '16px',
    fontSize: '12px',
    color: '#94a3b8',
  },
  status: {
    padding: '40px',
    textAlign: 'center',
    color: '#64748b',
  },
  errorBanner: {
    margin: '24px',
    padding: '12px 16px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '6px',
    fontSize: '14px',
  },
};
