import { useState } from 'react';
import type { CreateNoteInput, UpdateNoteInput, Note } from '../types';

interface NoteFormProps {
  initialData?: Partial<Note>;
  onSubmit: (data: CreateNoteInput | UpdateNoteInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function NoteForm({ initialData, onSubmit, onCancel, submitLabel = 'Save' }: NoteFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ title, content });
      if (!initialData?.id) {
        setTitle('');
        setContent('');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {error && <div style={styles.error}>{error}</div>}
      <div style={styles.field}>
        <label style={styles.label}>Title</label>
        <input
          data-testid="note-title-input"
          style={styles.input}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          required
          maxLength={255}
        />
      </div>
      <div style={styles.field}>
        <label style={styles.label}>Content</label>
        <textarea
          data-testid="note-content-input"
          style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Note content"
          required
        />
      </div>
      <div style={styles.actions}>
        <button data-testid="note-submit-btn" type="submit" disabled={submitting} style={styles.submitBtn}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button data-testid="note-cancel-btn" type="button" onClick={onCancel} style={styles.cancelBtn}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#475569',
  },
  input: {
    padding: '8px 10px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  submitBtn: {
    padding: '8px 18px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
  },
  cancelBtn: {
    padding: '8px 18px',
    backgroundColor: '#e2e8f0',
    color: '#334155',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
  },
  error: {
    padding: '8px 12px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '6px',
    fontSize: '13px',
  },
};
