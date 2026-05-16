'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { forensicApi } from '../services/forensic.api';

const KEYS = {
  all: ['forensic'] as const,
  dashboard: ['forensic', 'dashboard'] as const,
};

export function useForensicDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => forensicApi.getDashboardData(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

export function useUpdateCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, status }: { caseId: string; status: string }) => 
      forensicApi.updateCaseStatus(caseId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
