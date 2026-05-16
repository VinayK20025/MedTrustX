'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi, type SuperAdminFilters } from '../services/superAdmin.api';

const KEYS = {
  all: ['super-admin'] as const,
  summary: (f: SuperAdminFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useSuperAdminDashboard(filters: SuperAdminFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => superAdminApi.getDashboardSummary(filters),
    staleTime: 30_000,
    refetchInterval: 30_000, // Real-time for global control
  });
}

export function useSuspendTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, reason }: { tenantId: string; reason: string }) => superAdminApi.suspendTenant(tenantId, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useApplyPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ policyId, status }: { policyId: string; status: string }) => superAdminApi.applyPolicy(policyId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useLockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) => superAdminApi.lockUser(userId, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useEnforceMfa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => superAdminApi.enforceMfa(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useRevokeOverride() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (overrideId: string) => superAdminApi.revokeOverride(overrideId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => superAdminApi.acknowledgeAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useResolveAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => superAdminApi.resolveAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
