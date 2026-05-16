'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '../services/analytics.api';

const KEYS = {
  all: ['analyticsLayer'] as const,
  dashboard: ['analyticsLayer', 'dashboard'] as const,
};

export function useAnalyticsDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => analyticsApi.getDashboardData(),
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

export function useRestartPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pipelineId: string) => analyticsApi.restartPipeline(pipelineId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}

export function usePausePipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pipelineId: string) => analyticsApi.pausePipeline(pipelineId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}

export function useCancelQuery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (queryId: string) => analyticsApi.cancelQuery(queryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
