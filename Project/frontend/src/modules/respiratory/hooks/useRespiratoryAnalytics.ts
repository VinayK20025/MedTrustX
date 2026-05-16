'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { respiratoryApi, type RespiratoryFilters } from '../services/respiratory.api';
import type { RespiratoryDevice } from '../types/respiratory.types';

const KEYS = {
  all: ['respiratory'] as const,
  summary: (f: RespiratoryFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useRespiratoryDashboard(filters: RespiratoryFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => respiratoryApi.getDashboardSummary(filters),
    staleTime: 10_000, // Very aggressive caching for RT
    refetchInterval: 5_000, // 5-second polling for live vitals and device alarms
  });
}

export function useAcknowledgeRespiratoryAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => respiratoryApi.acknowledgeAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateDeviceSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ deviceId, settings }: { deviceId: string; settings: Partial<RespiratoryDevice> }) => respiratoryApi.updateDeviceSettings(deviceId, settings),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useCompleteProcedure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ procedureId, notes }: { procedureId: string; notes: string }) => respiratoryApi.completeProcedure(procedureId, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useRecordTherapy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (therapyId: string) => respiratoryApi.recordTherapy(therapyId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
