'use client';
import { useQuery } from '@tanstack/react-query';
import { internApi, type InternFilters } from '../services/intern.api';

const KEYS = {
  all: ['intern'] as const,
  summary: (f: InternFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useInternDashboard(filters: InternFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => internApi.getDashboardSummary(filters),
    staleTime: 60_000, // 1 minute polling (observational role)
    refetchInterval: 60_000,
  });
}
