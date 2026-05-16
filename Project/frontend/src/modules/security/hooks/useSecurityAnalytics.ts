'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { securityApi, type SecurityFilters } from '../services/security.api';

const KEYS = {
  all: ['security'] as const,
  summary: (f: SecurityFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useSecurityDashboard(filters: SecurityFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => securityApi.getDashboardSummary(filters),
    refetchInterval: 8_000, // Fast polling for live security monitoring
  });
}

export function useDispatchGuard() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ incidentId, guardId }: { incidentId: string; guardId: string }) => securityApi.dispatchGuard(incidentId, guardId), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useLockZone() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (zoneId: string) => securityApi.lockZone(zoneId), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useResolveSecurityIncident() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => securityApi.resolveIncident(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
