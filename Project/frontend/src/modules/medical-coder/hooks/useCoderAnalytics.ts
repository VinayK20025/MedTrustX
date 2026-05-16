'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coderApi, type CoderFilters } from '../services/coder.api';

const KEYS = {
  all: ['medicalCoder'] as const,
  summary: (f: CoderFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useCoderDashboard(filters: CoderFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => coderApi.getDashboardSummary(filters),
    staleTime: 30_000,
  });
}

export function useAddCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, type, code }: { caseId: string, type: 'ICD-10' | 'CPT', code: string }) => coderApi.addCode(caseId, type, code),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useRemoveCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, type, code }: { caseId: string, type: 'ICD-10' | 'CPT', code: string }) => coderApi.removeCode(caseId, type, code),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useSubmitChart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (caseId: string) => coderApi.submitChart(caseId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
