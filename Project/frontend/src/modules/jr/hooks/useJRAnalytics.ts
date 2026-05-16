'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jrApi, type JRFilters } from '../services/jr.api';

const KEYS = {
  all: ['jr'] as const,
  summary: (f: JRFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useJRDashboard(filters: JRFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => jrApi.getDashboardSummary(filters),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useUpdateJRTaskStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, stepId }: { taskId: string; stepId: string }) => jrApi.updateTaskStep(taskId, stepId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
