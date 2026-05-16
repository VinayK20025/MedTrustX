'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { icnApi, type IcnFilters } from '../services/icn.api';

const KEYS = {
  all: ['icn'] as const,
  summary: (f: IcnFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useIcnDashboard(filters: IcnFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => icnApi.getDashboardSummary(filters), refetchInterval: 30_000 });
}

export function useUpdateChecklistItem() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ auditId, itemId, status, notes }: { auditId: string; itemId: string; status: 'Pass' | 'Fail'; notes?: string }) => icnApi.updateChecklistItem(auditId, itemId, status, notes), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useSubmitAudit() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (auditId: string) => icnApi.submitAudit(auditId), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useUpdateIcnTask() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => icnApi.updateTaskStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useReportIcnIssue() {
  return useMutation({ mutationFn: (payload: { type: string; desc: string; ward: string }) => icnApi.reportIssue(payload.type, payload.desc, payload.ward) });
}
