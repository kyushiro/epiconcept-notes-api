import { useState, useEffect, useCallback } from 'react';
import * as meetingsApi from '../api/meetings.api';
import type { Meeting, CreateMeetingInput, UpdateMeetingInput } from '../types';

interface UseMeetingsReturn {
  meetings: Meeting[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  createMeeting: (data: CreateMeetingInput) => Promise<Meeting>;
  updateMeeting: (id: string, data: UpdateMeetingInput) => Promise<Meeting>;
  deleteMeeting: (id: string) => Promise<void>;
}

export function useMeetings(): UseMeetingsReturn {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    meetingsApi
      .list()
      .then((data) => {
        if (!cancelled) {
          setMeetings(data);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const createMeeting = useCallback(async (data: CreateMeetingInput): Promise<Meeting> => {
    const meeting = await meetingsApi.create(data);
    setMeetings((prev) => [meeting, ...prev]);
    return meeting;
  }, []);

  const updateMeeting = useCallback(
    async (id: string, data: UpdateMeetingInput): Promise<Meeting> => {
      const updated = await meetingsApi.update(id, data);
      setMeetings((prev) => prev.map((m) => (m.id === id ? updated : m)));
      return updated;
    },
    [],
  );

  const deleteMeeting = useCallback(async (id: string): Promise<void> => {
    await meetingsApi.remove(id);
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return { meetings, loading, error, refresh, createMeeting, updateMeeting, deleteMeeting };
}
