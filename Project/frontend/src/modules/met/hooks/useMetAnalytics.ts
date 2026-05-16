'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { metApi, type MetFilters } from '../services/met.api';
import type { MetTask, DiagnosticStep } from '../types/met.types';

const KEYS = {
  all: ['met'] as const,
  summary: (f: MetFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useMetDashboard(filters: MetFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => metApi.getDashboardSummary(filters),
    staleTime: 10_000,
  });
}

export function useUpdateMetTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: MetTask['status'] }) => metApi.updateTaskStatus(taskId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateDiagnosticStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, stepId, status, notes }: { taskId: string; stepId: string; status: DiagnosticStep['status']; notes?: string }) => metApi.updateDiagnosticStep(taskId, stepId, status, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
