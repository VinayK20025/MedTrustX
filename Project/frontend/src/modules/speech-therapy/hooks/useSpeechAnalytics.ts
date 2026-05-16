'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { speechApi, type SpeechFilters } from '../services/speech.api';
import type { SpeechAssessment, SpeechTherapyPlan } from '../types/speech.types';

const KEYS = {
  all: ['speech'] as const,
  summary: (f: SpeechFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useSpeechDashboard(filters: SpeechFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => speechApi.getDashboardSummary(filters),
    staleTime: 60_000,
  });
}

export function useStartSpeechSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => speechApi.startSession(sessionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useCompleteSpeechSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, notes }: { sessionId: string; notes: string }) => speechApi.completeSession(sessionId, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useSubmitSpeechAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assessment: Partial<SpeechAssessment>) => speechApi.submitAssessment(assessment),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateSpeechPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, updates }: { planId: string; updates: Partial<SpeechTherapyPlan> }) => speechApi.updateTherapyPlan(planId, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
