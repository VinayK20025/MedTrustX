'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { telehealthCoordApi, type ThcFilters } from '../services/telehealth-coord.api';

const KEYS = {
  all: ['telehealth-coord'] as const,
  summary: (f: ThcFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useTelehealthCoordDashboard(filters: ThcFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => telehealthCoordApi.getDashboardSummary(filters), refetchInterval: 10_000 });
}

export function useNotifyDoctor() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => telehealthCoordApi.notifyDoctor(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useRescheduleSession() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => telehealthCoordApi.rescheduleSession(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useResolveIssue() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => telehealthCoordApi.resolveIssue(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
