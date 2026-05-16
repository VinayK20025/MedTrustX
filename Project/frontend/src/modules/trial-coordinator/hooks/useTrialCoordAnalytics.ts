'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trialCoordApi, type TcFilters } from '../services/trial-coordinator.api';

const KEYS = {
  all: ['trial-coordinator'] as const,
  summary: (f: TcFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useTrialCoordDashboard(filters: TcFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => trialCoordApi.getDashboardSummary(filters), refetchInterval: 60_000 });
}

export function useCompleteVisitTask() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => trialCoordApi.completeVisitTask(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useResolveDeviation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => trialCoordApi.resolveDeviation(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
