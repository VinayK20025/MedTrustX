'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mortuaryApi, type MortFilters } from '../services/mortuary.api';

const KEYS = {
  all: ['mortuary'] as const,
  summary: (f: MortFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useMortuaryDashboard(filters: MortFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => mortuaryApi.getDashboardSummary(filters), refetchInterval: 60_000 });
}

export function useVerifyIdentity() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => mortuaryApi.verifyIdentity(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useAuthorizeRelease() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => mortuaryApi.authorizeRelease(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useConfirmRelease() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, recipient }: { id: string; recipient: string }) => mortuaryApi.confirmRelease(id, recipient), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
