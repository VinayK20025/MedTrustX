'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hvacApi, type HvacFilters } from '../services/hvac.api';

const KEYS = {
  all: ['hvac'] as const,
  summary: (f: HvacFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useHvacDashboard(filters: HvacFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => hvacApi.getDashboardSummary(filters),
    refetchInterval: 10_000, // Very high frequency for live sensor data
  });
}

export function useUpdateHvacTask() {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: ({ id, payload }: { id: string; payload: any }) => hvacApi.updateTaskState(id, payload), 
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) 
  });
}

export function useCompleteHvacSafety() {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: (id: string) => hvacApi.completeSafetyCheck(id), 
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) 
  });
}

export function useAdjustSystem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: string, params: any }) => hvacApi.adjustSystemParameters(id, params),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) 
  });
}
