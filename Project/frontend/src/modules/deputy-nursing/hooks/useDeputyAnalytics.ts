'use client';
import { useQuery } from '@tanstack/react-query';
import { deputyApi, type DeputyFilters } from '../services/deputy.api';

const KEYS = {
  all: ['deputy-nursing'] as const,
  summary: (f: DeputyFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useDeputyDashboard(filters: DeputyFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => deputyApi.getDashboardSummary(filters),
    staleTime: 30_000, // 30s polling for real-time execution
    refetchInterval: 30_000,
  });
}
