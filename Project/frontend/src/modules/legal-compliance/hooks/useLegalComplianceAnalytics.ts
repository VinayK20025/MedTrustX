'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { legalComplianceApi, type LcFilters } from '../services/legal-compliance.api';

const KEYS = {
  all: ['legal-compliance'] as const,
  summary: (f: LcFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useLegalComplianceDashboard(filters: LcFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => legalComplianceApi.getDashboardSummary(filters), refetchInterval: 60_000 });
}

export function useInitiateLicenseRenewal() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => legalComplianceApi.initiateRenewal(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useResolveViolation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, notes }: { id: string; notes: string }) => legalComplianceApi.resolveViolation(id, notes), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useExportStatutoryReport() {
  return useMutation({ mutationFn: () => legalComplianceApi.exportComplianceReport() });
}
