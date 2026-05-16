'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gpApi, type GPFilters } from '../services/gp.api';

const KEYS = {
  all: ['gp'] as const,
  summary: (f: GPFilters) => [...KEYS.all, 'summary', f] as const,
};

/** 15-second polling — fast OPD queue updates */
export function useGPDashboard(filters: GPFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => gpApi.getDashboardSummary(filters),
    staleTime: 15_000,
    refetchInterval: 15_000,
  });
}

export function useCallNextPatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => gpApi.callNextPatient(),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useSubmitConsultation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: any }) => gpApi.submitConsultation(patientId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
