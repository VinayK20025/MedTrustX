'use client';
import { useQuery } from '@tanstack/react-query';
import { wardApi, type WardFilters } from '../services/ward.api';

const KEYS = {
  all: ['ward-incharge'] as const,
  summary: (f: WardFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useWardDashboard(filters: WardFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => wardApi.getDashboardSummary(filters),
    staleTime: 30_000, // 30s polling for operational ward control
    refetchInterval: 30_000,
  });
}
