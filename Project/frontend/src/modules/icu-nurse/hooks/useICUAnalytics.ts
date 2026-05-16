'use client';
import { useQuery } from '@tanstack/react-query';
import { icuApi, type ICUFilters } from '../services/icu.api';

const KEYS = {
  all: ['icu-nurse'] as const,
  summary: (f: ICUFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useICUDashboard(filters: ICUFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => icuApi.getDashboardSummary(filters),
    staleTime: 5_000, // 5s polling for near real-time ICU monitoring
    refetchInterval: 5_000,
  });
}
