'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { legalRiskApi, type RiskFilters } from '../services/legal-risk.api';

const KEYS = {
  all: ['legal-risk'] as const,
  summary: (f: RiskFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useLegalRiskDashboard(filters: RiskFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => legalRiskApi.getDashboardSummary(filters), refetchInterval: 60_000 });
}

export function useUpdateRiskStatus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => legalRiskApi.updateRiskStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useUpdateMitigationStatus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => legalRiskApi.updateMitigationStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useAddMitigationAction() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ riskId, payload }: { riskId: string; payload: any }) => legalRiskApi.addMitigationAction(riskId, payload), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
