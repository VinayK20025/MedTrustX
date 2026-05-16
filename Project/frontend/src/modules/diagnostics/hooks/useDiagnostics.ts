'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { diagnosticsApi } from '../services/diagnostics.api';
import type { DiagnosticsFilters, DiagnosticResult } from '../types/diagnostics.types';
import { notify } from '@/store/notification.store';

const KEYS = {
  all: ['diagnostics'] as const,
  results: (f: DiagnosticsFilters) => [...KEYS.all, 'results', f] as const,
};

export function useDiagnosticResults(filters: DiagnosticsFilters) {
  return useQuery({
    queryKey: KEYS.results(filters),
    queryFn: () => diagnosticsApi.getResults(filters),
  });
}

export function useOrderTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<DiagnosticResult>) => diagnosticsApi.orderTest(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      notify.success('Order Placed', 'Diagnostic test ordered successfully.');
    },
    onError: () => {
      notify.error('Error', 'Failed to order diagnostic test.');
    }
  });
}
