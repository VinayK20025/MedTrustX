'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { processingApi, type ProcessingFilters } from '../services/processing.api';

const KEYS = {
  all: ['processing'] as const,
  summary: (f: ProcessingFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useProcessingDashboard(filters: ProcessingFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => processingApi.getDashboardSummary(filters),
    staleTime: 10_000,
  });
}

export function useSubmitTask() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ taskId, data }: { taskId: string; data: any }) => processingApi.submitTask(taskId, data), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useBulkProcess() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (taskIds: string[]) => processingApi.bulkProcessTasks(taskIds), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
