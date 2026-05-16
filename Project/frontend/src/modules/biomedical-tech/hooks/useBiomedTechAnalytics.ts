'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { biomedTechApi, type BiomedTechFilters } from '../services/biomedTech.api';
import type { BiomedTask } from '../types/biomedTech.types';

const KEYS = {
  all: ['biomedTech'] as const,
  summary: (f: BiomedTechFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useBiomedTechDashboard(filters: BiomedTechFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => biomedTechApi.getDashboardSummary(filters),
    staleTime: 10_000,
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: BiomedTask['status'] }) => biomedTechApi.updateTaskStatus(taskId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateChecklistStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, stepId, isCompleted }: { taskId: string; stepId: string; isCompleted: boolean }) => biomedTechApi.updateChecklistStep(taskId, stepId, isCompleted),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useEscalateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, reason }: { taskId: string; reason: string }) => biomedTechApi.escalateTask(taskId, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
