'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditorApi, type AuditFilters } from '../services/external-auditor.api';

const KEYS = {
  all: ['external-auditor'] as const,
  summary: (f: AuditFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useAuditorDashboard(filters: AuditFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => auditorApi.getDashboardSummary(filters), refetchInterval: 120_000 });
}

export function useUpdateCheckStatus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => auditorApi.updateCheckStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useCloseFinding() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => auditorApi.closeFinding(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useGenerateAuditReport() {
  return useMutation({ mutationFn: (id: string) => auditorApi.generateReport(id) });
}
