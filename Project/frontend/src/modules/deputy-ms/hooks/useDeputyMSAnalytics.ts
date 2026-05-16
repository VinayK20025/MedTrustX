'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deputyMSApi, type DeputyFilters } from '../services/deputy-ms.api';

const KEYS = {
  all: ['deputy-ms'] as const,
  summary: (f: DeputyFilters) => [...KEYS.all, 'summary', f] as const,
};

/** 15-second polling — execution console needs hyper-real-time data */
export function useDeputyMSDashboard(filters: DeputyFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => deputyMSApi.getDashboardSummary(filters),
    staleTime: 15_000,
    refetchInterval: 15_000,
  });
}

export function useResolveItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deputyMSApi.resolveItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useCompleteDeputyTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deputyMSApi.completeTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
