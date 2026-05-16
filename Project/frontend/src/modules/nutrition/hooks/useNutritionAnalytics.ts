'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nutritionApi, type NutritionFilters } from '../services/nutrition.api';
import type { NutritionAssessment, NutritionDietPlan, NutritionIntakeLog } from '../types/nutrition.types';

const KEYS = {
  all: ['nutrition'] as const,
  summary: (f: NutritionFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useNutritionDashboard(filters: NutritionFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => nutritionApi.getDashboardSummary(filters),
    staleTime: 60_000,
  });
}

export function useSubmitNutritionAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assessment: Partial<NutritionAssessment>) => nutritionApi.submitAssessment(assessment),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateDietPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, updates }: { planId: string; updates: Partial<NutritionDietPlan> }) => nutritionApi.updateDietPlan(planId, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useLogIntake() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (log: Partial<NutritionIntakeLog>) => nutritionApi.logIntake(log),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useFlagNonCompliance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (logId: string) => nutritionApi.flagNonCompliance(logId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
