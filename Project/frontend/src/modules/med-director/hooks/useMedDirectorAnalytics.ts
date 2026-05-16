'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medDirectorApi, type MedDirectorFilters } from '../services/med-director.api';

const KEYS = {
  all: ['med-director'] as const,
  summary: (filters: MedDirectorFilters) => [...KEYS.all, 'summary', filters] as const,
};

/** 60-second polling — clinical governance needs timely but not hyper-real-time data */
export function useMedDirectorDashboard(filters: MedDirectorFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => medDirectorApi.getDashboardSummary(filters),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

export function useEscalateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (incidentId: string) => medDirectorApi.escalateIncident(incidentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useResolveMedDirectorAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => medDirectorApi.resolveAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
