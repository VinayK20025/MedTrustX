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
    staleTime: 5_000,
    refetchInterval: 5_000, // Poll every 5s for fast flow log ingestion
  });
}

export function useEnforcePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (policyId: string) => networkApi.enforcePolicy(policyId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useRevokeIdentity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (identityId: string) => networkApi.revokeIdentity(identityId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => networkApi.acknowledgeAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
