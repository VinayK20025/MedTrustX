'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsOrchestratorApi, type OrchestratorFilters } from '../services/notifications-orchestrator.api';

const KEYS = {
  all: ['notifications-orchestrator'] as const,
  dashboard: (filters: OrchestratorFilters) => [...KEYS.all, 'dashboard', filters] as const,
};

export function useNotificationsOrchestratorDashboard(filters: OrchestratorFilters = {}) {
  return useQuery({
    queryKey: KEYS.dashboard(filters),
    queryFn: () => notificationsOrchestratorApi.getDashboardData(filters),
    staleTime: 10_000,
    refetchInterval: 12_000,
  });
}

export function useRetryOrchestratorMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsOrchestratorApi.retryMessage(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useDiscardOrchestratorMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsOrchestratorApi.discardMessage(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useToggleOrchestratorRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => notificationsOrchestratorApi.toggleRoute(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useMarkOrchestratorNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsOrchestratorApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateOrchestratorPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof notificationsOrchestratorApi.updatePreferences>[0]) => notificationsOrchestratorApi.updatePreferences(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
