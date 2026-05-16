'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingApi, type TrainingFilters } from '../services/training.api';

const KEYS = {
  all: ['training'] as const,
  summary: (f: TrainingFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useTrainingDashboard(filters: TrainingFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => trainingApi.getDashboardSummary(filters),
    staleTime: 30_000,
  });
}

export function useAssignTraining() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ programId, staffIds }: { programId: string; staffIds: string[] }) => trainingApi.assignTraining(programId, staffIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useSendTrainingReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => trainingApi.sendReminder(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useMarkTrainingAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, staffId, present }: { sessionId: string; staffId: string; present: boolean }) => trainingApi.markAttendance(sessionId, staffId, present),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
