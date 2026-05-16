'use client';
import { useQuery } from '@tanstack/react-query';
import { erApi, type ERFilters } from '../services/er.api';

const KEYS = {
  all: ['er-nurse'] as const,
  summary: (f: ERFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useERDashboard(filters: ERFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => erApi.getDashboardSummary(filters),
    staleTime: 5_000, // 5s polling for chaos/speed triage tracking
    refetchInterval: 5_000,
  });
}
