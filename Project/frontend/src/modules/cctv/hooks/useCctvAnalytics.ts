'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cctvApi, type CctvFilters } from '../services/cctv.api';

const KEYS = {
  all: ['cctv'] as const,
  summary: (f: CctvFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useCctvDashboard(filters: CctvFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => cctvApi.getDashboardSummary(filters),
    refetchInterval: 8_000, // Fast polling — CCTV is a live monitoring system
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => cctvApi.acknowledgeAlert(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useDispatchGuardFromCctv() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => cctvApi.dispatchGuard(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useTagIncident() {
  return useMutation({ mutationFn: ({ camId, type, desc }: { camId: string; type: string; desc: string }) => cctvApi.tagIncident(camId, type, desc) });
}

export function useEscalateAlert() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => cctvApi.escalateAlert(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
