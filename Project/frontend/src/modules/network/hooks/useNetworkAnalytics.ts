'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { networkApi, type NetworkFilters } from '../services/network.api';

const KEYS = {
  all: ['network'] as const,
  summary: (f: NetworkFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useNetworkDashboard(filters: NetworkFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => networkApi.getDashboardSummary(filters),
    refetchInterval: 10_000, // High-frequency polling for network maps
  });
}

export function useRestartDevice() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => networkApi.restartDevice(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useBlockNetworkThreat() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => networkApi.blockThreat(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useResolveNetworkIncident() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => networkApi.resolveIncident(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
