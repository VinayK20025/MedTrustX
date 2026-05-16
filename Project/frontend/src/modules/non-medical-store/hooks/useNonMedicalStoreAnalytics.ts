'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nonMedicalStoreApi, type NmFilters } from '../services/non-medical-store.api';

const KEYS = {
  all: ['non-medical-store'] as const,
  summary: (f: NmFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useNmStoreDashboard(filters: NmFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => nonMedicalStoreApi.getDashboardSummary(filters), refetchInterval: 30_000 });
}

export function useReceiveBulkStock() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, qty }: { id: string; qty: number }) => nonMedicalStoreApi.receiveBulkStock(id, qty), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useIssueBulkStock() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => nonMedicalStoreApi.issueBulkStock(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
