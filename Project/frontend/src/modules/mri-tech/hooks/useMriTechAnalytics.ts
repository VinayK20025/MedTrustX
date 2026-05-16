'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mriTechApi, type MriFilters } from '../services/mriTech.api';

const KEYS = {
  all: ['mriTech'] as const,
  summary: (f: MriFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useMriTechDashboard(filters: MriFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => mriTechApi.getDashboardSummary(filters),
    staleTime: 5_000,
    refetchInterval: 5_000, // Frequent polling for live scan progress
  });
}

export function useAnswerSafetyQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ checklistId, questionId, isSafe }: { checklistId: string, questionId: string, isSafe: boolean }) => mriTechApi.answerSafetyQuestion(checklistId, questionId, isSafe),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useSignSafetyChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (checklistId: string) => mriTechApi.signSafetyChecklist(checklistId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useEmergencyStop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => mriTechApi.triggerEmergencyStop(),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
