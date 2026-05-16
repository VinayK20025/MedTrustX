'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cooApi, type CooFilters } from '../services/coo.api';

const KEYS = {
  all: ['coo'] as const,
  summary: (filters: CooFilters) => [...KEYS.all, 'summary', filters] as const,
};

export function useCooDashboard(filters: CooFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => cooApi.getDashboardSummary(filters),
    staleTime: 30_000, // 30 seconds (very real-time)
    refetchInterval: 30_000, 
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ alertId, actionType }: { alertId: string; actionType: 'assign' | 'resolve' | 'escalate' }) => 
      cooApi.resolveAlert(alertId, actionType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) => 
      cooApi.updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
