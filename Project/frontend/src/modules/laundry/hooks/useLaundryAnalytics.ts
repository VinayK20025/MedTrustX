'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { laundryApi, type LndFilters } from '../services/laundry.api';

const KEYS = {
  all: ['laundry'] as const,
  summary: (f: LndFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useLaundryDashboard(filters: LndFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => laundryApi.getDashboardSummary(filters), refetchInterval: 30_000 });
}

export function useUpdateLinenTask() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => laundryApi.updateTaskStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useAdvanceBatch() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => laundryApi.advanceBatchStage(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
