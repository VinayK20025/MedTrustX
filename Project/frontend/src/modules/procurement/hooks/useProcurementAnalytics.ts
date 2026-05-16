'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { procurementApi, type ProcFilters } from '../services/procurement.api';

const KEYS = {
  all: ['procurement'] as const,
  summary: (f: ProcFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useProcurementDashboard(filters: ProcFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => procurementApi.getDashboardSummary(filters), refetchInterval: 60_000 });
}

export function useApprovePurchaseRequest() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => procurementApi.approveRequest(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useRejectPurchaseRequest() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => procurementApi.rejectRequest(id, reason), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (payload: any) => procurementApi.createPurchaseOrder(payload), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
