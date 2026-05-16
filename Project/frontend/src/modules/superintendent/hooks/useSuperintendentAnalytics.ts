'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superintendentApi, type SuperFilters } from '../services/superintendent.api';

const KEYS = {
  all: ['superintendent'] as const,
  summary: (f: SuperFilters) => [...KEYS.all, 'summary', f] as const,
};

/** 20-second polling — floor operations need near-real-time awareness */
export function useSuperintendentDashboard(filters: SuperFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => superintendentApi.getDashboardSummary(filters),
    staleTime: 20_000,
    refetchInterval: 20_000,
  });
}

export function useResolveFlowItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => superintendentApi.resolveFlowItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useResolveSuperAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => superintendentApi.resolveAlert(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => superintendentApi.completeTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
