'use client';
import { useQuery } from '@tanstack/react-query';
import { anmApi, type ANMFilters } from '../services/anm.api';

const KEYS = {
  all: ['anm'] as const,
  summary: (f: ANMFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useANMDashboard(filters: ANMFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => anmApi.getDashboardSummary(filters),
    staleTime: 300_000, // 5 minutes, as ANMs operate often offline or with slow connections
    refetchInterval: 300_000,
  });
}
