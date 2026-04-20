import { useState, useEffect, useCallback } from 'react';
import * as notesApi from '../api/notes.api';
import type { Note, CreateNoteInput, UpdateNoteInput } from '../types';

interface UseNotesReturn {
  notes: Note[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  createNote: (data: CreateNoteInput) => Promise<Note>;
  updateNote: (id: string, data: UpdateNoteInput) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
}

export function useNotes(): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    notesApi
      .list()
      .then((data) => {
        if (!cancelled) {
          setNotes(data);
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

  const createNote = useCallback(async (data: CreateNoteInput): Promise<Note> => {
    const note = await notesApi.create(data);
    setNotes((prev) => [note, ...prev]);
    return note;
  }, []);

  const updateNote = useCallback(async (id: string, data: UpdateNoteInput): Promise<Note> => {
    const updated = await notesApi.update(id, data);
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
    return updated;
  }, []);

  const deleteNote = useCallback(async (id: string): Promise<void> => {
    await notesApi.remove(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notes, loading, error, refresh, createNote, updateNote, deleteNote };
}
