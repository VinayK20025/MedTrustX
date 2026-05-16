'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { insuranceApi, type InsuranceFilters } from '../services/insurance.api';

const KEYS = {
  all: ['insurance'] as const,
  summary: (f: InsuranceFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useInsuranceDashboard(filters: InsuranceFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => insuranceApi.getDashboardSummary(filters),
    staleTime: 20_000,
  });
}

export function useSubmitClaim() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => insuranceApi.submitClaim(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useResubmitClaim() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => insuranceApi.resubmitClaim(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useResolveMismatch() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => insuranceApi.resolveMismatch(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
