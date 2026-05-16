'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '../services/workflow.api';

const KEYS = {
  all: ['workflow'] as const,
  dashboard: ['workflow', 'dashboard'] as const,
};

export function useWorkflowDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => workflowApi.getDashboardData(),
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useClaimTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => workflowApi.claimTask(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
