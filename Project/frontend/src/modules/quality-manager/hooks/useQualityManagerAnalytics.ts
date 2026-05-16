'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qualityManagerApi, type QmFilters } from '../services/quality-manager.api';

const KEYS = {
  all: ['quality-manager'] as const,
  summary: (f: QmFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useQualityManagerDashboard(filters: QmFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => qualityManagerApi.getDashboardSummary(filters), refetchInterval: 30_000 });
}

export function useInitiateRca() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => qualityManagerApi.initiateRca(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useApproveCapa() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => qualityManagerApi.approveCapa(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useDismissQmAlert() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => qualityManagerApi.dismissAlert(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
