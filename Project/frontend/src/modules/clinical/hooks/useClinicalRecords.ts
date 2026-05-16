'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clinicalApi } from '../services/clinical.api';
import type { ClinicalFilters, ClinicalNote } from '../types/clinical.types';
import { notify } from '@/store/notification.store';

const KEYS = {
  all: ['clinical'] as const,
  notes: (f: ClinicalFilters) => [...KEYS.all, 'notes', f] as const,
};

export function useClinicalNotes(filters: ClinicalFilters) {
  return useQuery({
    queryKey: KEYS.notes(filters),
    queryFn: () => clinicalApi.getNotes(filters),
  });
}

export function useSaveClinicalNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ClinicalNote>) => clinicalApi.saveNote(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      notify.success('Note Saved', 'Clinical record updated successfully.');
    },
    onError: () => {
      notify.error('Error', 'Failed to save clinical note.');
    }
  });
}
