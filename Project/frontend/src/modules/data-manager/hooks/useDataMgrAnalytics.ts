'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataMgrApi, type DmFilters } from '../services/data-manager.api';

const KEYS = {
  all: ['data-manager'] as const,
  summary: (f: DmFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useDataMgrDashboard(filters: DmFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => dataMgrApi.getDashboardSummary(filters), refetchInterval: 60_000 });
}

export function useResolveQuery() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => dataMgrApi.resolveQuery(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useLockDataset() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => dataMgrApi.lockDataset(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useRunValidation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => dataMgrApi.runValidation(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
