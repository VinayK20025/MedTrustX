'use client';
import { useQuery } from '@tanstack/react-query';
import { icuApi, type ICUFilters } from '../services/icu.api';

const KEYS = {
  all: ['icu'] as const,
  summary: (f: ICUFilters) => [...KEYS.all, 'summary', f] as const,
};

/** 8-second polling for ICU telemetry updates */
export function useICUDashboard(filters: ICUFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => icuApi.getDashboardSummary(filters),
    staleTime: 8_000,
    refetchInterval: 8_000,
  });
}
