'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pathologistApi, type PathologistFilters } from '../services/pathologist.api';

const KEYS = {
  all: ['pathologist'] as const,
  summary: (f: PathologistFilters) => [...KEYS.all, 'summary', f] as const,
};

export function usePathologistDashboard(filters: PathologistFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => pathologistApi.getDashboardSummary(filters),
    staleTime: 10_000,
  });
}

export function useValidateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, notes }: { caseId: string; notes: string }) => pathologistApi.validateReport(caseId, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => pathologistApi.acknowledgeAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
