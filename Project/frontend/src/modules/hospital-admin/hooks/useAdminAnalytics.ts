'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminFilters } from '../services/admin.api';

const KEYS = {
  all: ['hospitalAdmin'] as const,
  summary: (f: AdminFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useAdminDashboard(filters: AdminFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => adminApi.getDashboardSummary(filters),
    staleTime: 15_000, // Faster refresh for command center
    refetchInterval: 30_000, // Auto polling for real-time feel
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => adminApi.acknowledgeAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useTriggerBedDiversion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (departmentId: string) => adminApi.triggerBedDiversion(departmentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
