'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { otTechApi, type OTTechFilters } from '../services/otTech.api';
import type { EquipmentSetupTask, MaintenanceLog } from '../types/otTech.types';

const KEYS = {
  all: ['otTech'] as const,
  summary: (f: OTTechFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useOTTechDashboard(filters: OTTechFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => otTechApi.getDashboardSummary(filters),
    staleTime: 5_000,
    refetchInterval: 5_000, // Poll every 5 seconds for live hardware telemetry
  });
}

export function useUpdateSetupTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: EquipmentSetupTask['status'] }) => otTechApi.updateSetupTask(taskId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => otTechApi.acknowledgeAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useLogMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (log: Partial<MaintenanceLog>) => otTechApi.logMaintenance(log),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
