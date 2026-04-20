import { useState } from 'react';
import type { CreateMeetingInput, UpdateMeetingInput, Meeting } from '../types';

type MeetingFormData = CreateMeetingInput | UpdateMeetingInput;

interface MeetingFormProps {
  initialData?: Partial<Meeting>;
  onSubmit: (data: MeetingFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

function toDatetimeLocal(iso: string | undefined): string {
  if (!iso) return '';
  // Convert ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
  return iso.slice(0, 16);
}

export function MeetingForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: MeetingFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [startAt, setStartAt] = useState(toDatetimeLocal(initialData?.startAt));
  const [endAt, setEndAt] = useState(toDatetimeLocal(initialData?.endAt));
  const [location, setLocation] = useState(initialData?.location ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const data: MeetingFormData = {
        title,
        description,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        location: location || undefined,
      };
      await onSubmit(data);
      if (!initialData?.id) {
        setTitle('');
        setDescription('');
        setStartAt('');
        setEndAt('');
        setLocation('');
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
      <div style={styles.grid}>
        <div style={styles.field}>
          <label style={styles.label}>Title</label>
          <input
            style={styles.input}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Meeting title"
            required
            maxLength={255}
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Location (optional)</label>
          <input
            style={styles.input}
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Room / URL"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Start</label>
          <input
            style={styles.input}
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            required
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>End</label>
          <input
            style={styles.input}
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            required
          />
        </div>
      </div>
      <div style={styles.field}>
        <label style={styles.label}>Description</label>
        <textarea
          style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Meeting description"
          required
        />
      </div>
      <div style={styles.actions}>
        <button type="submit" disabled={submitting} style={styles.submitBtn}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={styles.cancelBtn}>
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
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
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
