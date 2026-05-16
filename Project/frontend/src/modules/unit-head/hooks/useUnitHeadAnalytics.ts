'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { unitHeadApi, type UnitFilters } from '../services/unit-head.api';

const KEYS = {
  all: ['unit-head'] as const,
  summary: (f: UnitFilters) => [...KEYS.all, 'summary', f] as const,
};

/** 10-second polling — life-critical, fastest in the system */
export function useUnitHeadDashboard(filters: UnitFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => unitHeadApi.getDashboardSummary(filters),
    staleTime: 10_000,
    refetchInterval: 10_000,
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => unitHeadApi.acknowledgeAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useTriggerIntervention() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, type }: { patientId: string; type: string }) => unitHeadApi.triggerIntervention(patientId, type),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
