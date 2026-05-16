'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cnoApi, type CnoFilters } from '../services/cno.api';

const KEYS = {
  all: ['cno'] as const,
  summary: (filters: CnoFilters) => [...KEYS.all, 'summary', filters] as const,
};

export function useCnoDashboard(filters: CnoFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => cnoApi.getDashboardSummary(filters),
    staleTime: 30_000, // 30 seconds - Highly operational
    refetchInterval: 30_000,
  });
}

export function useAssignTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, nurseId }: { taskId: string; nurseId: string }) => cnoApi.assignTask(taskId, nurseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useResolveCnoAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => cnoApi.resolveAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
