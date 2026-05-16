'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cisoApi, type CisoFilters } from '../services/ciso.api';

const KEYS = {
  all: ['ciso'] as const,
  summary: (filters: CisoFilters) => [...KEYS.all, 'summary', filters] as const,
};

/** 10-second polling — security operations demand near-real-time visibility */
export function useCisoDashboard(filters: CisoFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => cisoApi.getDashboardSummary(filters),
    staleTime: 10_000,
    refetchInterval: 10_000,
  });
}

export function useBlockSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sourceId: string) => cisoApi.blockSource(sourceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useResolveCisoAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => cisoApi.resolveAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useContainIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (incidentId: string) => cisoApi.containIncident(incidentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useRevokeAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => cisoApi.revokeAccess(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
