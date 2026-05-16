'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { threatDetectionApi } from '../services/threat-detection.api';

const KEYS = {
  all:       ['threatDetection'] as const,
  dashboard: ['threatDetection', 'dashboard'] as const,
};

export function useThreatDetectionDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => threatDetectionApi.getDashboard(),
    staleTime: 10_000,
    refetchInterval: 20_000,
  });
}

export function useUpdateAlertStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ alertId, status }: { alertId: string; status: string }) =>
      threatDetectionApi.updateAlertStatus(alertId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useToggleDetectionRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: string) => threatDetectionApi.toggleRule(ruleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAcknowledgeAnomaly() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (anomalyId: string) => threatDetectionApi.acknowledgeAnomaly(anomalyId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
