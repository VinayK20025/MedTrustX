'use client';
import { useQuery } from '@tanstack/react-query';
import { nurseApi, type NurseFilters } from '../services/nurse.api';

const KEYS = {
  all: ['nurse'] as const,
  summary: (f: NurseFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useNurseDashboard(filters: NurseFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => nurseApi.getDashboardSummary(filters),
    staleTime: 30_000, // 30s polling for real-time task triggers
    refetchInterval: 30_000,
  });
}
