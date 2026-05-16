'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ccoApi, type CcoFilters } from '../services/cco.api';

const KEYS = {
  all: ['cco'] as const,
  summary: (filters: CcoFilters) => [...KEYS.all, 'summary', filters] as const,
};

/** 3-minute polling — compliance is audit-cycle driven, not real-time */
export function useCcoDashboard(filters: CcoFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => ccoApi.getDashboardSummary(filters),
    staleTime: 180_000,
    refetchInterval: 180_000,
  });
}

export function useAssignViolation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ violationId, assignee }: { violationId: string; assignee: string }) =>
      ccoApi.assignViolation(violationId, assignee),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useResolveCcoAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => ccoApi.resolveAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useEscalateViolation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (violationId: string) => ccoApi.escalateViolation(violationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
