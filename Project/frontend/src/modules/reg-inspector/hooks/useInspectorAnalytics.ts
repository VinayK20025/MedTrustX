'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { regInspectorApi, type RiFilters } from '../services/reg-inspector.api';

const KEYS = {
  all: ['reg-inspector'] as const,
  summary: (f: RiFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useInspectorDashboard(filters: RiFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => regInspectorApi.getDashboardSummary(filters), refetchInterval: 120_000 });
}

export function useIssueNotice() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ violationId, type }: { violationId: string; type: string }) => regInspectorApi.issueNotice(violationId, type), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useCloseViolation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => regInspectorApi.closeViolation(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useGenerateInspectionReport() {
  return useMutation({ mutationFn: (id: string) => regInspectorApi.generateInspectionReport(id) });
}
