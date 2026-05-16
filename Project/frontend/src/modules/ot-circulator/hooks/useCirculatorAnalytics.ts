'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { circulatorApi, type CirculatorFilters } from '../services/circulator.api';
import type { SurgicalLog } from '../types/circulator.types';

const KEYS = {
  all: ['circulator'] as const,
  summary: (f: CirculatorFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useCirculatorDashboard(filters: CirculatorFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => circulatorApi.getDashboardSummary(filters),
    staleTime: 5_000,
    refetchInterval: 5_000, // Poll every 5 seconds for fast-moving requests (blood, imaging)
  });
}

export function useFulfillRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => circulatorApi.fulfillRequest(requestId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useEscalateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => circulatorApi.escalateRequest(requestId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAddSurgicalLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (log: Partial<SurgicalLog>) => circulatorApi.addSurgicalLog(log),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useConfirmSafetyCheck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => circulatorApi.confirmSafetyCheck(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
