'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { remoteConsultantApi, type RcFilters } from '../services/remote-consultant.api';

const KEYS = {
  all: ['remote-consultant'] as const,
  summary: (f: RcFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useConsultantDashboard(filters: RcFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => remoteConsultantApi.getDashboardSummary(filters), refetchInterval: 60_000 });
}

export function useSubmitOpinion() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ caseId, opinion }: { caseId: string; opinion: any }) => remoteConsultantApi.submitOpinion(caseId, opinion), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useRequestMoreInfo() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ caseId, message }: { caseId: string; message: string }) => remoteConsultantApi.requestMoreInfo(caseId, message), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
