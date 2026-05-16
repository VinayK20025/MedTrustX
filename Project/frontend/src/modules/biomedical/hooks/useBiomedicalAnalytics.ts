'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { biomedicalApi, type BiomedicalFilters } from '../services/biomedical.api';
import type { WorkOrder } from '../types/biomedical.types';

const KEYS = {
  all: ['biomedical'] as const,
  summary: (f: BiomedicalFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useBiomedicalDashboard(filters: BiomedicalFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => biomedicalApi.getDashboardSummary(filters),
    staleTime: 30_000,
    refetchInterval: 30_000, // Poll every 30 seconds for fleet telemetry
  });
}

export function useUpdateWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: WorkOrder['status'] }) => biomedicalApi.updateWorkOrder(orderId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useLogCalibration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recordId: string) => biomedicalApi.logCalibration(recordId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => biomedicalApi.acknowledgeAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
