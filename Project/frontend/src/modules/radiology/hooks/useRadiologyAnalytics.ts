'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { radiologyApi, type RadiologyFilters } from '../services/radiology.api';
import type { DiagnosticReport, Annotation } from '../types/radiology.types';

const KEYS = {
  all: ['radiology'] as const,
  summary: (f: RadiologyFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useRadiologyDashboard(filters: RadiologyFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => radiologyApi.getDashboardSummary(filters),
    staleTime: 10_000,
  });
}

export function useFinalizeReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, report }: { id: string; report: DiagnosticReport }) => radiologyApi.finalizeReport(id, report),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useSaveAnnotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ann: Annotation) => radiologyApi.saveAnnotation(ann),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => radiologyApi.acknowledgeAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
