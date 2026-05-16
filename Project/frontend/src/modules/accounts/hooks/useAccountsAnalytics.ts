'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi, type AccountsFilters } from '../services/accounts.api';

const KEYS = {
  all: ['accounts'] as const,
  summary: (f: AccountsFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useAccountsDashboard(filters: AccountsFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => accountsApi.getDashboardSummary(filters),
    staleTime: 30_000,
  });
}

export function useApproveExpense() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => accountsApi.approveExpense(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useResolveDiscrepancy() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => accountsApi.resolveDiscrepancy(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useAppealClaim() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => accountsApi.appealClaim(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
