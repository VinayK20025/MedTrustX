'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emtApi, type EmtFilters } from '../services/emt.api';

const KEYS = {
  all: ['emt'] as const,
  summary: (f: EmtFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useEmtDashboard(filters: EmtFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => emtApi.getDashboardSummary(filters), refetchInterval: 5_000 });
}

export function useCompleteEmtTask() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => emtApi.completeTask(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useConnectDevice() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => emtApi.connectDevice(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useLogEmtAction() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (action: string) => emtApi.logAction(action), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
