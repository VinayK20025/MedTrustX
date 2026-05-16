'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { surgeonApi, type SurgeonFilters } from '../services/surgeon.api';

const KEYS = {
  all: ['surgeon'] as const,
  summary: (f: SurgeonFilters) => [...KEYS.all, 'summary', f] as const,
  intraop: ['surgeon', 'intraop'] as const,
};

export function useSurgeonDashboard(filters: SurgeonFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => surgeonApi.getDashboardSummary(filters),
    staleTime: 5_000, // Very aggressive for intra-op data (5s)
    refetchInterval: 5_000, // Poll every 5 seconds for vitals
  });
}

export function useAdvanceSurgicalStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, stepId }: { caseId: string; stepId: string }) => surgeonApi.advanceSurgicalStep(caseId, stepId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useSignPostOpNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => surgeonApi.signPostOpNote(noteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useLogComplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, text }: { caseId: string; text: string }) => surgeonApi.logComplication(caseId, text),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
