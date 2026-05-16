'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appSupportApi, type AppSupportFilters } from '../services/appsupport.api';

const KEYS = {
  all: ['appsupport'] as const,
  summary: (f: AppSupportFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useAppSupportDashboard(filters: AppSupportFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => appSupportApi.getDashboardSummary(filters),
    refetchInterval: 10_000, // Frequent polling for live monitoring and incident alerts
  });
}

export function useUpdateAppIncident() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }: { id: string, status: string }) => appSupportApi.updateIncidentStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useRestartService() {
  return useMutation({ mutationFn: (service: string) => appSupportApi.restartService(service) });
}

export function useRollbackRelease() {
  return useMutation({ mutationFn: (version: string) => appSupportApi.rollbackRelease(version) });
}
