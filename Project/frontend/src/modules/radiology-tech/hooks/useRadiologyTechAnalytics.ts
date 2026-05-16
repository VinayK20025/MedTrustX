'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { radiologyTechApi, type RadiologyTechFilters } from '../services/radiologyTech.api';

const KEYS = {
  all: ['radiologyTech'] as const,
  summary: (f: RadiologyTechFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useRadiologyTechDashboard(filters: RadiologyTechFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => radiologyTechApi.getDashboardSummary(filters),
    staleTime: 5_000,
    refetchInterval: 5_000, // Frequent polling for live scanner state
  });
}

export function useStartScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, protocolId, deviceId }: { patientId: string, protocolId: string, deviceId: string }) => radiologyTechApi.startScan(patientId, protocolId, deviceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useTransferToPacs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => radiologyTechApi.transferToPacs(imageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => radiologyTechApi.acknowledgeAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
