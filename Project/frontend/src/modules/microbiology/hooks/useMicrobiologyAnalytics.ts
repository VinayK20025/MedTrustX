'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { microbiologyApi, type MicrobiologyFilters } from '../services/microbiology.api';

const KEYS = {
  all: ['microbiology'] as const,
  summary: (f: MicrobiologyFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useMicrobiologyDashboard(filters: MicrobiologyFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => microbiologyApi.getDashboardSummary(filters),
    staleTime: 10_000,
  });
}

export function useFinalizeAst() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sampleId: string) => microbiologyApi.finalizeAst(sampleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => microbiologyApi.acknowledgeAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
