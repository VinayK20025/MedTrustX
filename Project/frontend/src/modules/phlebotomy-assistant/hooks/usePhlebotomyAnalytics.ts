'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phlebotomyApi, type PhlebotomyFilters } from '../services/phlebotomy.api';

const KEYS = {
  all: ['phlebotomy'] as const,
  summary: (f: PhlebotomyFilters) => [...KEYS.all, 'summary', f] as const,
};

export function usePhlebotomyDashboard(filters: PhlebotomyFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => phlebotomyApi.getDashboardSummary(filters),
    staleTime: 10_000,
  });
}

export function useVerifyStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stepId: string) => phlebotomyApi.verifyStep(stepId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function usePrintLabel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (testId: string) => phlebotomyApi.printLabel(testId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useTransferBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (batchId: string) => phlebotomyApi.transferBatch(batchId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
