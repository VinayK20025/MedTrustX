'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pamApi, type PAMFilters } from '../services/pam.api';

const KEYS = {
  all: ['pam'] as const,
  summary: (f: PAMFilters) => [...KEYS.all, 'summary', f] as const,
};

export function usePamDashboard(filters: PAMFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => pamApi.getDashboardSummary(filters),
    staleTime: 30_000,
    refetchInterval: 15_000, // Faster refetch for live monitoring
  });
}

export function useApproveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => pamApi.approveRequest(requestId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useRejectRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) => pamApi.rejectRequest(requestId, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useTerminateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => pamApi.terminateSession(sessionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => pamApi.acknowledgeAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useVaultAccounts(filters?: any) {
  return useQuery({
    queryKey: [...KEYS.all, 'vault', filters],
    queryFn: () => pamApi.getVaultAccounts(filters),
  });
}

export function useCheckoutVaultAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (accountId: string) => pamApi.checkoutVaultAccount(accountId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
