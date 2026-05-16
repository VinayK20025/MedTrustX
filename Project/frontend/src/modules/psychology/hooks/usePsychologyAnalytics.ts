'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { psychologyApi, type PsychologyFilters } from '../services/psychology.api';
import type { PsychologyNote, PsychologyConfidentialNote } from '../types/psychology.types';

const KEYS = {
  all: ['psychology'] as const,
  summary: (f: PsychologyFilters) => [...KEYS.all, 'summary', f] as const,
  confidential: ['psychology', 'confidential'] as const,
};

export function usePsychologyDashboard(filters: PsychologyFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => psychologyApi.getDashboardSummary(filters),
    staleTime: 60_000,
  });
}

export function useSubmitSessionNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (note: Partial<PsychologyNote>) => psychologyApi.submitSessionNote(note),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useSignNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => psychologyApi.signNote(noteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUnlockConfidentialVault() {
  return useMutation({
    mutationFn: (pin: string) => psychologyApi.unlockConfidentialNotes(pin),
  });
}

export function useSubmitConfidentialNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (note: Partial<PsychologyConfidentialNote>) => psychologyApi.submitConfidentialNote(note),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.confidential }),
  });
}
