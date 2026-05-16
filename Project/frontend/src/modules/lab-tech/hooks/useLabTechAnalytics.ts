'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labTechApi, type LabTechFilters } from '../services/labTech.api';

const KEYS = {
  all: ['labTech'] as const,
  summary: (f: LabTechFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useLabTechDashboard(filters: LabTechFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => labTechApi.getDashboardSummary(filters),
    staleTime: 5_000,
    refetchInterval: 5_000, // Frequent polling for high-volume lab environments
  });
}

export function useCompleteStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stepId: string) => labTechApi.completeStep(stepId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useLoadDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (deviceId: string) => labTechApi.loadDeviceBatch(deviceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => labTechApi.acknowledgeAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
