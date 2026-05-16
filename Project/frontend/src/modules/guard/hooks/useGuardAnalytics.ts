'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guardApi, type GuardFilters } from '../services/guard.api';

const KEYS = {
  all: ['guard'] as const,
  summary: (f: GuardFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useGuardDashboard(filters: GuardFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => guardApi.getDashboardSummary(filters),
    refetchInterval: 10_000,
  });
}

export function useUpdateGuardTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => guardApi.updateTaskStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useCheckPatrolPoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => guardApi.checkPatrolPoint(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useEscalateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => guardApi.escalateIncident(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useReportIncident() {
  return useMutation({
    mutationFn: (payload: { type: string; description: string; location: string }) => guardApi.reportIncident(payload),
  });
}
