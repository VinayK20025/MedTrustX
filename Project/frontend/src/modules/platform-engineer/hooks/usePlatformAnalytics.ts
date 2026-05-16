'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformApi, type PlatformFilters } from '../services/platform.api';

const KEYS = {
  all: ['platform'] as const,
  summary: (f: PlatformFilters) => [...KEYS.all, 'summary', f] as const,
};

export function usePlatformDashboard(filters: PlatformFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => platformApi.getDashboardSummary(filters),
    staleTime: 10_000,
    refetchInterval: 10_000, // Poll every 10 seconds for real-time K8s events
  });
}

export function useScaleWorkload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ workloadId, replicas }: { workloadId: string; replicas: number }) => platformApi.scaleWorkload(workloadId, replicas),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useRestartWorkload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (workloadId: string) => platformApi.restartWorkload(workloadId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => platformApi.acknowledgeAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
