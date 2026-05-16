'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientCounselorApi, type CounselorFilters } from '../services/patientCounselor.api';

const KEYS = {
  all: ['patientCounselor'] as const,
  summary: (f: CounselorFilters) => [...KEYS.all, 'summary', f] as const,
};

export function usePatientCounselorDashboard(filters: CounselorFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => patientCounselorApi.getDashboardSummary(filters),
    staleTime: 30_000,
  });
}

export function useMarkPointDiscussed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, pointId }: { sessionId: string, pointId: string }) => patientCounselorApi.markPointDiscussed(sessionId, pointId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useSaveSessionNotes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, notes }: { sessionId: string, notes: string }) => patientCounselorApi.saveSessionNotes(sessionId, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useCompleteCounseling() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patientId: string) => patientCounselorApi.completeCounseling(patientId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
