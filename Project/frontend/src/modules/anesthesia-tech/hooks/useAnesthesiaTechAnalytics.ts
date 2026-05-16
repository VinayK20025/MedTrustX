'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { anesthesiaTechApi, type AnesthesiaTechFilters } from '../services/anesthesiaTech.api';

const KEYS = {
  all: ['anesthesiaTech'] as const,
  summary: (f: AnesthesiaTechFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useAnesthesiaTechDashboard(filters: AnesthesiaTechFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => anesthesiaTechApi.getDashboardSummary(filters),
    staleTime: 5_000,
    refetchInterval: 5_000, // Poll every 5 seconds for critical gas telemetry
  });
}

export function useVerifySetupTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => anesthesiaTechApi.verifySetupTask(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function usePrepareDrug() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => anesthesiaTechApi.prepareDrug(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => anesthesiaTechApi.acknowledgeAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
