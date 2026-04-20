import { useState } from 'react';
import { useMeetings } from '../hooks/useMeetings';
import { MeetingCard } from '../components/MeetingCard';
import { MeetingForm } from '../components/MeetingForm';
import type { CreateMeetingInput, UpdateMeetingInput } from '../types';

export function MeetingsPage() {
  const { meetings, loading, error, createMeeting, updateMeeting, deleteMeeting } = useMeetings();
  const [showCreate, setShowCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function handleCreate(data: CreateMeetingInput | UpdateMeetingInput) {
    setCreateError(null);
    try {
      await createMeeting(data as CreateMeetingInput);
      setShowCreate(false);
    } catch (err) {
      setCreateError((err as Error).message);
      throw err;
    }
  }

  async function handleUpdate(id: string, data: UpdateMeetingInput) {
    await updateMeeting(id, data);
  }

  async function handleDelete(id: string) {
    await deleteMeeting(id);
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.heading}>Meetings</h2>
        <button onClick={() => setShowCreate((v) => !v)} style={styles.newBtn}>
          {showCreate ? 'Cancel' : '+ New Meeting'}
        </button>
      </div>

      {showCreate && (
        <div style={styles.createPanel}>
          <h3 style={styles.panelHeading}>Create Meeting</h3>
          {createError && <div style={styles.error}>{createError}</div>}
          <MeetingForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            submitLabel="Create Meeting"
          />
        </div>
      )}

      {loading && <div style={styles.status}>Loading meetings…</div>}
      {error && <div style={styles.errorBanner}>{error}</div>}

      {!loading && !error && meetings.length === 0 && (
        <div style={styles.empty}>No meetings yet. Schedule your first meeting above.</div>
      )}

      <div style={styles.list}>
        {meetings.map((meeting) => (
          <MeetingCard
            key={meeting.id}
            meeting={meeting}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: '900px',
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
};
