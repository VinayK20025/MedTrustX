'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { electricianApi, type ElectFilters } from '../services/electrician.api';

const KEYS = {
  all: ['electrician'] as const,
  summary: (f: ElectFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useElectricianDashboard(filters: ElectFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => electricianApi.getDashboardSummary(filters),
    refetchInterval: 15_000, 
  });
}

export function useUpdateElectTask() {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: ({ id, payload }: { id: string; payload: any }) => electricianApi.updateTaskState(id, payload), 
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) 
  });
}

export function useCompleteSafetyCheck() {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: (id: string) => electricianApi.completeSafetyCheck(id), 
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) 
  });
}
