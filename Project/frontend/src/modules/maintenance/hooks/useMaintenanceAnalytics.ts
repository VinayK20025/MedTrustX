'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi, type MaintenanceFilters } from '../services/maintenance.api';

const KEYS = {
  all: ['maintenance'] as const,
  summary: (f: MaintenanceFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useMaintenanceDashboard(filters: MaintenanceFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => maintenanceApi.getDashboardSummary(filters),
    refetchInterval: 30_000, 
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) => maintenanceApi.updateTaskStatus(id, status, notes), 
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) 
  });
}
