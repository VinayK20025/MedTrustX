'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mroApi, type MroFilters } from '../services/mro.api';

const KEYS = {
  all: ['mro'] as const,
  summary: (f: MroFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useMroDashboard(filters: MroFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => mroApi.getDashboardSummary(filters),
    staleTime: 30_000,
  });
}

export function useAssignCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ codingId, type, code }: { codingId: string, type: 'ICD' | 'CPT', code: string }) => mroApi.assignCode(codingId, type, code),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useFinalizeCoding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (codingId: string) => mroApi.finalizeCoding(codingId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useNudgePhysician() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (deficiencyId: string) => mroApi.nudgePhysician(deficiencyId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
