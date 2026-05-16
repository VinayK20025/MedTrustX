'use client';
import { useQuery } from '@tanstack/react-query';
import { icnApi, type ICNFilters } from '../services/icn.api';

const KEYS = {
  all: ['icn-nurse'] as const,
  summary: (f: ICNFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useICNDashboard(filters: ICNFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => icnApi.getDashboardSummary(filters),
    staleTime: 60_000, // 60s for analytical dashboards
    refetchInterval: 60_000,
  });
}
