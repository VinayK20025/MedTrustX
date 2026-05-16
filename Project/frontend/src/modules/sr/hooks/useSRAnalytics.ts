'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { srApi, type SRFilters } from '../services/sr.api';

const KEYS = {
  all: ['sr'] as const,
  summary: (f: SRFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useSRDashboard(filters: SRFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => srApi.getDashboardSummary(filters),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useAssignSRTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) => srApi.assignTask(taskId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
