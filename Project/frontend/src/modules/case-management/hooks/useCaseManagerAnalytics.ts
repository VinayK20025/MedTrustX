'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { caseManagerApi, type CaseFilters } from '../services/caseManager.api';

const KEYS = {
  all: ['caseManagement'] as const,
  summary: (f: CaseFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useCaseManagerDashboard(filters: CaseFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => caseManagerApi.getDashboardSummary(filters),
    staleTime: 30_000,
  });
}

export function useUpdateDischargeClearance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, type, value }: { caseId: string, type: string, value: boolean }) => caseManagerApi.updateDischargeClearance(caseId, type, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAppealInsurance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (insuranceId: string) => caseManagerApi.appealInsuranceDenial(insuranceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useResolveCaseAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => caseManagerApi.resolveAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
