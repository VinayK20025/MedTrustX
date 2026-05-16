'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mlflowApi } from '../services/mlflow.api';

const KEYS = {
  all: ['mlflow'] as const,
  dashboard: ['mlflow', 'dashboard'] as const,
};

export function useMlflowDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => mlflowApi.getDashboardData(),
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

export function useKillRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (runId: string) => mlflowApi.killRun(runId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}

export function useTransitionModelStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ modelName, version, stage }: { modelName: string; version: string; stage: string }) => 
      mlflowApi.transitionModelStage(modelName, version, stage),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
