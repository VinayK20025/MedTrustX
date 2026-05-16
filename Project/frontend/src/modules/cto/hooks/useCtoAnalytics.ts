'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ctoApi, type CtoFilters } from '../services/cto.api';

const KEYS = {
  all: ['cto'] as const,
  summary: (filters: CtoFilters) => [...KEYS.all, 'summary', filters] as const,
};

/** 30-second polling — engineering observability needs near-real-time */
export function useCtoDashboard(filters: CtoFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => ctoApi.getDashboardSummary(filters),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useRetryPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pipelineId: string) => ctoApi.retryPipeline(pipelineId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useResolveCtoAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => ctoApi.resolveAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
