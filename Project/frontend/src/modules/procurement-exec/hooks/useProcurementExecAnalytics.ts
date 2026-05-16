'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { procurementExecApi, type ExecFilters } from '../services/procurement-exec.api';

const KEYS = {
  all: ['procurement-exec'] as const,
  summary: (f: ExecFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useProcExecDashboard(filters: ExecFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => procurementExecApi.getDashboardSummary(filters), refetchInterval: 30_000 });
}

export function useExecCreatePO() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ requestId, payload }: { requestId: string; payload: any }) => procurementExecApi.createPurchaseOrder(requestId, payload), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useUpdateDeliveryStatus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => procurementExecApi.updateDeliveryStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
