/**
 * MedTrustX — AI Platform Hooks
 * React Query hooks for all AI Platform service operations.
 */
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiPlatformService } from '../services/aiPlatformService';

const KEYS = {
  dashboard: ['ai-platform', 'dashboard'] as const,
  models:    ['ai-platform', 'models'] as const,
  training:  ['ai-platform', 'training'] as const,
  cdss:      ['ai-platform', 'cdss'] as const,
  twins:     ['ai-platform', 'twins'] as const,
  pipelines: ['ai-platform', 'pipelines'] as const,
  features:  ['ai-platform', 'features'] as const,
  governance:['ai-platform', 'governance'] as const,
  metrics:   ['ai-platform', 'metrics'] as const,
};

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export function useAiPlatformDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => aiPlatformService.getDashboard(),
    staleTime: 30_000,
    refetchInterval: 60_000,
    select: r => r.data,
  });
}

// ─── Models ────────────────────────────────────────────────────────────────────
export function useAiModels() {
  return useQuery({
    queryKey: KEYS.models,
    queryFn: () => aiPlatformService.getModels(),
    staleTime: 30_000,
    select: r => r.data,
  });
}

export function useRetrainModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => aiPlatformService.retrainModel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.models });
      qc.invalidateQueries({ queryKey: KEYS.training });
      qc.invalidateQueries({ queryKey: KEYS.dashboard });
    },
  });
}

export function useDeployModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => aiPlatformService.deployModel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.models });
      qc.invalidateQueries({ queryKey: KEYS.dashboard });
    },
  });
}

// ─── Training Jobs ─────────────────────────────────────────────────────────────
export function useTrainingJobs() {
  return useQuery({
    queryKey: KEYS.training,
    queryFn: () => aiPlatformService.getTrainingJobs(),
    staleTime: 15_000,
    refetchInterval: 30_000,
    select: r => r.data,
  });
}

export function useCancelTrainingJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => aiPlatformService.cancelTrainingJob(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.training }),
  });
}

// ─── CDSS Alerts ───────────────────────────────────────────────────────────────
export function useCdssAlerts() {
  return useQuery({
    queryKey: KEYS.cdss,
    queryFn: () => aiPlatformService.getCdssAlerts(),
    staleTime: 10_000,
    refetchInterval: 30_000,
    select: r => r.data,
  });
}

export function useAcknowledgeCdssAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, by }: { id: string; by: string }) =>
      aiPlatformService.acknowledgeCdssAlert(id, by),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.cdss });
      qc.invalidateQueries({ queryKey: KEYS.dashboard });
    },
  });
}

export function useResolveCdssAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => aiPlatformService.resolveCdssAlert(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.cdss });
      qc.invalidateQueries({ queryKey: KEYS.dashboard });
    },
  });
}

// ─── Digital Twins ─────────────────────────────────────────────────────────────
export function useDigitalTwins() {
  return useQuery({
    queryKey: KEYS.twins,
    queryFn: () => aiPlatformService.getDigitalTwins(),
    staleTime: 15_000,
    refetchInterval: 60_000,
    select: r => r.data,
  });
}

export function useSyncDigitalTwin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => aiPlatformService.syncDigitalTwin(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.twins }),
  });
}

// ─── Analytics Pipelines ───────────────────────────────────────────────────────
export function useAnalyticsPipelines() {
  return useQuery({
    queryKey: KEYS.pipelines,
    queryFn: () => aiPlatformService.getAnalyticsPipelines(),
    staleTime: 20_000,
    refetchInterval: 60_000,
    select: r => r.data,
  });
}

export function useTriggerPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => aiPlatformService.triggerPipeline(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.pipelines }),
  });
}

// ─── Feature Store ─────────────────────────────────────────────────────────────
export function useFeatureStore() {
  return useQuery({
    queryKey: KEYS.features,
    queryFn: () => aiPlatformService.getFeatureStore(),
    staleTime: 60_000,
    select: r => r.data,
  });
}

// ─── Governance ────────────────────────────────────────────────────────────────
export function useGovernanceRecords() {
  return useQuery({
    queryKey: KEYS.governance,
    queryFn: () => aiPlatformService.getGovernanceRecords(),
    staleTime: 30_000,
    select: r => r.data,
  });
}

export function useApproveGovernance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => aiPlatformService.approveGovernance(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.governance }),
  });
}

export function useRejectGovernance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      aiPlatformService.rejectGovernance(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.governance }),
  });
}

// ─── Platform Metrics ──────────────────────────────────────────────────────────
export function useAiPlatformMetrics() {
  return useQuery({
    queryKey: KEYS.metrics,
    queryFn: () => aiPlatformService.getMetrics(),
    staleTime: 30_000,
    refetchInterval: 60_000,
    select: r => r.data,
  });
}
