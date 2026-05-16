'use client';
import { useQuery } from '@tanstack/react-query';
import { itOpsApi, type ITOpsFilters } from '../services/itOps.api';

const KEYS = {
  all: ['it-ops'] as const,
  summary: (f: ITOpsFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useITOpsDashboard(filters: ITOpsFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => itOpsApi.getDashboardSummary(filters),
    staleTime: 10_000, 
    refetchInterval: 10_000,
  });
}
