'use client';
import { useQuery } from '@tanstack/react-query';
import { nursingApi, type NursingFilters } from '../services/nursing.api';

const KEYS = {
  all: ['nursing'] as const,
  summary: (f: NursingFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useNursingDashboard(filters: NursingFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => nursingApi.getDashboardSummary(filters),
    staleTime: 60_000, // 1 min polling for operational adjustments
    refetchInterval: 60_000,
  });
}
