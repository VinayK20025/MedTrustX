'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { biochemistryApi, type BiochemFilters } from '../services/biochemistry.api';

const KEYS = {
  all: ['biochemistry'] as const,
  summary: (f: BiochemFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useBiochemDashboard(filters: BiochemFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => biochemistryApi.getDashboardSummary(filters),
    staleTime: 10_000,
  });
}

export function useValidateResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sampleId: string) => biochemistryApi.validateResult(sampleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useCalibrateInstrument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (analyzerId: string) => biochemistryApi.calibrateInstrument(analyzerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => biochemistryApi.acknowledgeAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
