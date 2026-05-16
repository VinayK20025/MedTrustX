'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emergencyCoordApi, type EcFilters } from '../services/emergency-coord.api';

const KEYS = {
  all: ['ec'] as const,
  summary: (f: EcFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useEcDashboard(filters: EcFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => emergencyCoordApi.getDashboardSummary(filters),
    refetchInterval: 2_000, // Sub-2s: life-critical real-time flow
  });
}

export function useAssignTriage() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, priority, dest }: { id: string; priority: string; dest: string }) => emergencyCoordApi.assignTriage(id, priority, dest), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useRedirectAmbulance() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ ambId, instruction }: { ambId: string; instruction: string }) => emergencyCoordApi.redirectAmbulance(ambId, instruction), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useEcUpdateTask() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => emergencyCoordApi.updateTask(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useEcBroadcast() {
  return useMutation({ mutationFn: (msg: string) => emergencyCoordApi.broadcastMessage(msg) });
}

export function useEscalateToDisaster() {
  return useMutation({ mutationFn: (reason: string) => emergencyCoordApi.escalateToDisaster(reason) });
}
