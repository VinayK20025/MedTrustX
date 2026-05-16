'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fireSafetyApi, type FireSafetyFilters } from '../services/fire-safety.api';

const KEYS = {
  all: ['fire-safety'] as const,
  summary: (f: FireSafetyFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useFireSafetyDashboard(filters: FireSafetyFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => fireSafetyApi.getDashboardSummary(filters),
    refetchInterval: 5_000, // Fast: fire monitoring is life-critical
  });
}

export function useTriggerAlarm() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (zoneId: string) => fireSafetyApi.triggerAlarm(zoneId), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useEvacuateZone() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (zoneId: string) => fireSafetyApi.evacuateZone(zoneId), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useNotifyFireDept() {
  return useMutation({ mutationFn: (incidentId: string) => fireSafetyApi.notifyFireDept(incidentId) });
}

export function useCompleteResponseStep() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, step }: { id: string; step: number }) => fireSafetyApi.completeResponseStep(id, step), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useRaiseEquipmentFault() {
  return useMutation({ mutationFn: (eqId: string) => fireSafetyApi.raiseEquipmentFault(eqId) });
}
