'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cioApi, type CioFilters } from '../services/cio.api';

const KEYS = {
  all: ['cio'] as const,
  summary: (filters: CioFilters) => [...KEYS.all, 'summary', filters] as const,
};

export function useCioDashboard(filters: CioFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => cioApi.getDashboardSummary(filters),
    staleTime: 15_000, // 15 seconds - High observability needs
    refetchInterval: 15_000,
  });
}

export function useResolveCioAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => cioApi.resolveAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useAcknowledgeIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (incidentId: string) => cioApi.acknowledgeIncident(incidentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
