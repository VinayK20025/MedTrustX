'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { intensivistApi, type IntensivistFilters } from '../services/intensivist.api';

const KEYS = {
  all: ['intensivist'] as const,
  summary: (f: IntensivistFilters) => [...KEYS.all, 'summary', f] as const,
};

/** 30-second polling for short-burst consult reviews */
export function useIntensivistDashboard(filters: IntensivistFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => intensivistApi.getDashboardSummary(filters),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useSubmitRecommendation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: any }) => intensivistApi.submitRecommendation(caseId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
