'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceApi } from '../services/performance.api';

const KEYS = {
  all: ['performance'] as const,
  dashboard: ['performance', 'dashboard'] as const,
};

export function usePerformanceDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => performanceApi.getDashboardData(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

export function useSubmitAppraisal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ appraisalId, data }: { appraisalId: string; data: any }) => 
      performanceApi.submitAppraisal(appraisalId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
