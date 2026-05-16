'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qualityAnalystApi, type QaFilters } from '../services/quality-analyst.api';

const KEYS = {
  all: ['qa'] as const,
  summary: (f: QaFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useQualityDashboard(filters: QaFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => qualityAnalystApi.getDashboardSummary(filters), refetchInterval: 60_000 });
}

export function useGenerateReport() {
  return useMutation({ mutationFn: (type: string) => qualityAnalystApi.generateReport(type) });
}

export function useTriggerValidation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (sourceId: string) => qualityAnalystApi.triggerValidation(sourceId), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useDismissInsight() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => qualityAnalystApi.dismissInsight(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useFlagAnomaly() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => qualityAnalystApi.flagAnomaly(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
