'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ctTechApi, type CtFilters } from '../services/ctTech.api';

const KEYS = {
  all: ['ctTech'] as const,
  summary: (f: CtFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useCtTechDashboard(filters: CtFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => ctTechApi.getDashboardSummary(filters),
    staleTime: 5_000,
    refetchInterval: 5_000, // Frequent polling for live scan progress
  });
}

export function useAnswerScreeningQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ screeningId, questionId, isSafe }: { screeningId: string, questionId: string, isSafe: boolean }) => ctTechApi.answerScreeningQuestion(screeningId, questionId, isSafe),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useSignScreening() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (screeningId: string) => ctTechApi.signScreening(screeningId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useTriggerScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => ctTechApi.triggerScan(),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
