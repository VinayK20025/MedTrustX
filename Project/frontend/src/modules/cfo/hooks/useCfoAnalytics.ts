'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cfoApi, type CfoFilters } from '../services/cfo.api';

const KEYS = {
  all: ['cfo'] as const,
  summary: (filters: CfoFilters) => [...KEYS.all, 'summary', filters] as const,
};

/** 2-minute polling — financial data is analytical, not real-time operational */
export function useCfoDashboard(filters: CfoFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => cfoApi.getDashboardSummary(filters),
    staleTime: 120_000,
    refetchInterval: 120_000,
  });
}

export function useApproveClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (claimId: string) => cfoApi.approveClaim(claimId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useResolveCfoAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => cfoApi.resolveAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
