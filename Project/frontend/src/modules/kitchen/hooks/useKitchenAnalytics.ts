'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kitchenApi, type KitFilters } from '../services/kitchen.api';

const KEYS = {
  all: ['kitchen'] as const,
  summary: (f: KitFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useKitchenDashboard(filters: KitFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => kitchenApi.getDashboardSummary(filters), refetchInterval: 30_000 });
}

export function useUpdateMealStatus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => kitchenApi.updateMealStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useToggleHygiene() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => kitchenApi.toggleHygiene(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
