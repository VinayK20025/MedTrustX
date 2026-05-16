'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { claimsApi, type ClaimsFilters } from '../services/claims.api';

const KEYS = {
  all: ['claims'] as const,
  summary: (f: ClaimsFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useClaimsDashboard(filters: ClaimsFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => claimsApi.getDashboardSummary(filters),
    staleTime: 15_000,
  });
}

export function useScheduleFollowUp() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ claimId, action, dueDate }: { claimId: string; action: string; dueDate: string }) => claimsApi.scheduleFollowUp(claimId, action, dueDate), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useCompleteFollowUp() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => claimsApi.markFollowUpComplete(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useResubmitClaim() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => claimsApi.resubmitClaim(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
