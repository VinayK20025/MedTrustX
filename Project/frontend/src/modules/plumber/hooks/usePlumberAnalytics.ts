'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plumberApi, type PlumFilters } from '../services/plumber.api';

const KEYS = {
  all: ['plumber'] as const,
  summary: (f: PlumFilters) => [...KEYS.all, 'summary', f] as const,
};

export function usePlumberDashboard(filters: PlumFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => plumberApi.getDashboardSummary(filters),
    refetchInterval: 15_000, 
  });
}

export function useUpdatePlumTask() {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: ({ id, payload }: { id: string; payload: any }) => plumberApi.updateTaskState(id, payload), 
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) 
  });
}

export function useCompleteHygieneCheck() {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: (id: string) => plumberApi.completeHygieneCheck(id), 
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) 
  });
}
