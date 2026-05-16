'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { researchNurseApi, type RnFilters } from '../services/research-nurse.api';

const KEYS = {
  all: ['research-nurse'] as const,
  summary: (f: RnFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useResearchNurseDashboard(filters: RnFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => researchNurseApi.getDashboardSummary(filters), refetchInterval: 15_000 });
}

export function useCompleteProtocolStep() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => researchNurseApi.completeProtocolStep(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useReportAdverseEvent() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (payload: any) => researchNurseApi.reportAdverseEvent(payload), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
