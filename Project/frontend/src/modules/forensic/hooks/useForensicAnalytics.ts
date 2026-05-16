'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { forensicApi, type FrFilters } from '../services/forensic.api';

const KEYS = {
  all: ['forensic'] as const,
  summary: (f: FrFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useForensicDashboard(filters: FrFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => forensicApi.getDashboardSummary(filters), refetchInterval: 120_000 });
}

export function useSealEvidence() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => forensicApi.sealEvidence(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useGenerateMLR() {
  return useMutation({ mutationFn: (caseId: string) => forensicApi.generateMLR(caseId) });
}

export function useTransferEvidence() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, recipient }: { id: string; recipient: string }) => forensicApi.transferEvidence(id, recipient), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
