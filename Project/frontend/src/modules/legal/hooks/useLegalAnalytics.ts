'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { legalApi, type LegalFilters } from '../services/legal.api';

const KEYS = {
  all: ['legal'] as const,
  summary: (f: LegalFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useLegalDashboard(filters: LegalFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => legalApi.getDashboardSummary(filters), refetchInterval: 120_000 });
}

export function useUpdateCaseStatus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => legalApi.updateCaseStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useUploadLegalDoc() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ caseId, file }: { caseId: string | null; file: any }) => legalApi.uploadDocument(caseId, file), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useAddTimelineEvent() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ caseId, event }: { caseId: string; event: string }) => legalApi.addTimelineEvent(caseId, event), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useRenewContract() {
  return useMutation({ mutationFn: (id: string) => legalApi.renewContract(id) });
}
