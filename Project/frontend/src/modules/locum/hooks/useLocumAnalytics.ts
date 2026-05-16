'use client';
import { useQuery } from '@tanstack/react-query';
import { locumApi, type LocumFilters } from '../services/locum.api';

const KEYS = {
  all: ['locum'] as const,
  summary: (f: LocumFilters) => [...KEYS.all, 'summary', f] as const,
};

/** 30-second polling for shift updates */
export function useLocumDashboard(filters: LocumFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => locumApi.getDashboardSummary(filters),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}
