'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { residentApi, type ResidentFilters } from '../services/resident.api';

const KEYS = {
  all: ['resident'] as const,
  summary: (f: ResidentFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useResidentDashboard(filters: ResidentFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => residentApi.getDashboardSummary(filters),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useUpdateResidentTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) => residentApi.updateTaskStatus(taskId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
