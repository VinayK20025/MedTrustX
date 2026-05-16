'use client';
import { useQuery } from '@tanstack/react-query';
import { sreApi, type SREFilters } from '../services/sre.api';

const KEYS = {
  all: ['sre'] as const,
  summary: (f: SREFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useSREDashboard(filters: SREFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => sreApi.getDashboardSummary(filters),
    staleTime: 5_000, 
    refetchInterval: 5_000, // fast refresh for real-time observability
  });
}
