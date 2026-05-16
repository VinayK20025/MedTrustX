'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dischargeApi, type DischargeFilters } from '../services/discharge.api';

const KEYS = {
  all: ['discharge'] as const,
  summary: (f: DischargeFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useDischargeDashboard(filters: DischargeFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => dischargeApi.getDashboardSummary(filters),
    staleTime: 15_000,
    refetchInterval: 20_000,
  });
}

export function useRequestClearance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, department }: { patientId: string; department: string }) => dischargeApi.requestClearance(patientId, department),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useConfirmDischarge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patientId: string) => dischargeApi.confirmDischarge(patientId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useEscalateDelay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patientId: string) => dischargeApi.escalateDelay(patientId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
