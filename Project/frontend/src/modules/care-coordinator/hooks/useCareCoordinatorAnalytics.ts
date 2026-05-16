'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { careCoordinatorApi, type CoordinationFilters } from '../services/careCoordinator.api';

const KEYS = {
  all: ['careCoordinator'] as const,
  summary: (f: CoordinationFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useCareCoordinatorDashboard(filters: CoordinationFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => careCoordinatorApi.getDashboardSummary(filters),
    staleTime: 30_000,
  });
}

export function useAssignTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, taskName, assignedTo, dueTime }: { planId: string; taskName: string; assignedTo?: string; dueTime?: string }) =>
      careCoordinatorApi.assignTask(planId, taskName, assignedTo, dueTime),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status, assignedTo }: { taskId: string; status: string; assignedTo?: string }) =>
      careCoordinatorApi.updateTask(taskId, status, assignedTo),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ milestoneId, status }: { milestoneId: string, status: string }) => careCoordinatorApi.updateMilestone(milestoneId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useResolveAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => careCoordinatorApi.resolveAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
