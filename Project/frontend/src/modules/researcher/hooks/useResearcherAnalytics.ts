'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { researcherApi, type ResFilters } from '../services/researcher.api';

const KEYS = {
  all: ['researcher'] as const,
  summary: (f: ResFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useResearcherDashboard(filters: ResFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => researcherApi.getDashboardSummary(filters), refetchInterval: 300_000 });
}

export function useLogAdverseEvent() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => researcherApi.logAdverseEvent(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useGenerateStudyReport() {
  return useMutation({ mutationFn: (id: string) => researcherApi.generateStudyReport(id) });
}
