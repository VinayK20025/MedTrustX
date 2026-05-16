'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hodApi, type HODFilters } from '../services/hod.api';

const KEYS = {
  all: ['hod'] as const,
  summary: (f: HODFilters) => [...KEYS.all, 'summary', f] as const,
};

/** 30-second polling — department operations require timely data */
export function useHODDashboard(filters: HODFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => hodApi.getDashboardSummary(filters),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useAssignCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, doctorId }: { caseId: string; doctorId: string }) => hodApi.assignCase(caseId, doctorId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useResolveHODAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => hodApi.resolveAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
