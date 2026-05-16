'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmoApi, type CmoFilters } from '../services/cmo.api';

const KEYS = {
  all: ['cmo'] as const,
  summary: (filters: CmoFilters) => [...KEYS.all, 'summary', filters] as const,
};

export function useCmoDashboard(filters: CmoFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => cmoApi.getDashboardSummary(filters),
    staleTime: 5 * 60_000, // 5 minutes
  });
}

export function useInitiateAudit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (caseId: string) => cmoApi.initiateAudit(caseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
