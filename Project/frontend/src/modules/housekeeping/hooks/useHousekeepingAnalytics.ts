'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { housekeepingApi, type HkFilters } from '../services/housekeeping.api';

const KEYS = {
  all: ['housekeeping'] as const,
  summary: (f: HkFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useHousekeepingDashboard(filters: HkFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => housekeepingApi.getDashboardSummary(filters), refetchInterval: 30_000 });
}

export function useUpdateCleaningStatus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => housekeepingApi.updateTaskStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useToggleChecklistItem() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ taskId, itemId }: { taskId: string; itemId: string }) => housekeepingApi.toggleChecklistItem(taskId, itemId), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
