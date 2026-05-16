'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, type InvFilters } from '../services/inventory.api';

const KEYS = {
  all: ['inventory'] as const,
  summary: (f: InvFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useInventoryDashboard(filters: InvFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => inventoryApi.getDashboardSummary(filters), refetchInterval: 60_000 });
}

export function useTriggerReorder() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, qty }: { id: string; qty: number }) => inventoryApi.triggerReorder(id, qty), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useDiscardExpired() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => inventoryApi.discardExpired(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
