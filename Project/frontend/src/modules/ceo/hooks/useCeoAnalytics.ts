'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ceoApi, type CeoFilters } from '../services/ceo.api';

const KEYS = {
  all: ['ceo'] as const,
  summary: (filters: CeoFilters) => [...KEYS.all, 'summary', filters] as const,
};

export function useCeoDashboard(filters: CeoFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => ceoApi.getDashboardSummary(filters),
    staleTime: 1 * 60_000, // 1 minute (more real-time than board)
    refetchInterval: 60_000, // Auto-refresh for operational view
  });
}

export function useApproveTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, action }: { taskId: string; action: string }) => ceoApi.approveTask(taskId, action),
    onSuccess: () => {
      // Invalidate to refresh task list
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useEscalateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => ceoApi.escalateAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
