'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { biomedApi } from '../services/biomed.api';

const KEYS = {
  all: ['biomedical'] as const,
  dashboard: ['biomedical', 'dashboard'] as const,
};

export function useBiomedDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => biomedApi.getDashboardData(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

export function useUpdateJobStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, status }: { jobId: string; status: string }) => 
      biomedApi.updateJobStatus(jobId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
