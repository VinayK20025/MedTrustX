'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { iamApi, type IAMFilters } from '../services/iam.api';

const KEYS = {
  all: ['iam'] as const,
  summary: (f: IAMFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useIamDashboard(filters: IAMFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => iamApi.getDashboardSummary(filters),
    staleTime: 30_000,
  });
}

export function useApproveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => iamApi.approveRequest(requestId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useRejectRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) => iamApi.rejectRequest(requestId, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useEnforceMfa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => iamApi.enforceMfa(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useLockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => iamApi.lockUser(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useReviewIdentities(campaignId?: string) {
  return useQuery({
    queryKey: [...KEYS.all, 'campaign', campaignId],
    queryFn: () => iamApi.getCampaignIdentities(campaignId!),
    enabled: !!campaignId,
    staleTime: 30_000,
  });
}

export function useCertifyIdentity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ identityId, action }: { identityId: string; action: 'approved' | 'revoked' }) => iamApi.certifyIdentity(identityId, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useToggleAuthMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ methodId, action }: { methodId: string; action: 'enable' | 'disable' | 'sync' }) => iamApi.toggleAuthMethod(methodId, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useTogglePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ policyId, action }: { policyId: string; action: 'enforced' | 'disabled' }) => iamApi.togglePolicy(policyId, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useDeletePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (policyId: string) => iamApi.deletePolicy(policyId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
