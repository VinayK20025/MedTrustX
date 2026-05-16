'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ambCoordinatorApi, type CoordFilters } from '../services/amb-coordinator.api';

const KEYS = {
  all: ['amb-coordinator'] as const,
  summary: (f: CoordFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useAmbCoordinatorDashboard(filters: CoordFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => ambCoordinatorApi.getDashboardSummary(filters), refetchInterval: 5_000 });
}

export function useAssignAmbulance() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ callId, unitId }: { callId: string; unitId: string }) => ambCoordinatorApi.assignUnit(callId, unitId), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useNotifyER() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (callId: string) => ambCoordinatorApi.notifyER(callId), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
