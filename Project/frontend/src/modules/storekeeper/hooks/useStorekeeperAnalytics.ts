'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storekeeperApi, type StoreFilters } from '../services/storekeeper.api';

const KEYS = {
  all: ['storekeeper'] as const,
  summary: (f: StoreFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useStorekeeperDashboard(filters: StoreFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => storekeeperApi.getDashboardSummary(filters), refetchInterval: 30_000 });
}

export function useReceiveStock() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, qty }: { id: string; qty: number }) => storekeeperApi.receiveStock(id, qty), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useIssueStock() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => storekeeperApi.issueStock(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
