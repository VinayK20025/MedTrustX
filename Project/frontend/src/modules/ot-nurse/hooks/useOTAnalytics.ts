'use client';
import { useQuery } from '@tanstack/react-query';
import { otApi, type OTFilters } from '../services/ot.api';

const KEYS = {
  all: ['ot-nurse'] as const,
  summary: (f: OTFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useOTDashboard(filters: OTFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => otApi.getDashboardSummary(filters),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}
