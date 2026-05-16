'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itApi, type ItFilters } from '../services/it.api';

const KEYS = {
  all: ['it'] as const,
  summary: (f: ItFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useItDashboard(filters: ItFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => itApi.getDashboardSummary(filters),
    refetchInterval: 10_000, // IT Dashboards require high-frequency polling
  });
}

export function useResolveItIncident() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => itApi.resolveIncident(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useRestartServer() {
  return useMutation({ mutationFn: (id: string) => itApi.restartServer(id) });
}

export function useBlockIp() {
  return useMutation({ mutationFn: (ip: string) => itApi.blockIpAddress(ip) });
}
