'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { disasterApi, type DisasterFilters } from '../services/disaster.api';

const KEYS = {
  all: ['disaster'] as const,
  summary: (f: DisasterFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useDisasterDashboard(filters: DisasterFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => disasterApi.getDashboardSummary(filters),
    refetchInterval: 3_000, // Life-critical: 3-second refresh
  });
}

export function useActivateProtocol() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (code: string) => disasterApi.activateProtocol(code), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useBroadcastAlert() {
  return useMutation({ mutationFn: ({ msg, channels }: { msg: string; channels: string[] }) => disasterApi.broadcastAlert(msg, channels) });
}

export function useUpdateCommandTask() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => disasterApi.updateTaskStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useReallocateResource() {
  return useMutation({ mutationFn: ({ id, qty }: { id: string; qty: number }) => disasterApi.reallocateResource(id, qty) });
}

export function useEscalateIncident() {
  return useMutation({ mutationFn: (id: string) => disasterApi.escalateIncident(id) });
}

export function useCloseIncident() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => disasterApi.closeIncident(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
