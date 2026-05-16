'use client';
import { useQuery } from '@tanstack/react-query';
import { triageApi, type TriageFilters } from '../services/triage.api';

const KEYS = {
  all: ['triage-nurse'] as const,
  summary: (f: TriageFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useTriageDashboard(filters: TriageFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => triageApi.getDashboardSummary(filters),
    staleTime: 5_000, // 5s for fast-moving queues
    refetchInterval: 5_000,
  });
}
