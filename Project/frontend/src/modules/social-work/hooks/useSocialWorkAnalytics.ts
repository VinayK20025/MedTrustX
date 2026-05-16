'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialWorkApi, type SocialWorkFilters } from '../services/socialWork.api';

const KEYS = {
  all: ['socialWork'] as const,
  summary: (f: SocialWorkFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useSocialWorkDashboard(filters: SocialWorkFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => socialWorkApi.getDashboardSummary(filters),
    staleTime: 30_000,
  });
}

export function useUpdateAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (caseId: string) => socialWorkApi.updateAssessmentStatus(caseId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useMatchResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ interventionId, resourceId }: { interventionId: string, resourceId: string }) => socialWorkApi.matchResource(interventionId, resourceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useCloseCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (caseId: string) => socialWorkApi.closeCase(caseId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
