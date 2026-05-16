'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rehabApi, type RehabFilters } from '../services/rehab.api';
import type { RehabAssessment, RehabTherapyPlan } from '../types/rehab.types';

const KEYS = {
  all: ['rehab'] as const,
  summary: (f: RehabFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useRehabDashboard(filters: RehabFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => rehabApi.getDashboardSummary(filters),
    staleTime: 60_000,
  });
}

export function useStartSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => rehabApi.startSession(sessionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useCompleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, notes }: { sessionId: string; notes: string }) => rehabApi.completeSession(sessionId, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useSubmitAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assessment: Partial<RehabAssessment>) => rehabApi.submitAssessment(assessment),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateTherapyPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, updates }: { planId: string; updates: Partial<RehabTherapyPlan> }) => rehabApi.updateTherapyPlan(planId, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
