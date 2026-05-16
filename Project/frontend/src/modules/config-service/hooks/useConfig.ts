'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configApi } from '../services/config.api';

const KEYS = {
  all: ['config'] as const,
  dashboard: ['config', 'dashboard'] as const,
};

export function useConfigDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => configApi.getDashboardData(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

export function useUpdateFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ flagId, status }: { flagId: string; status: string }) => 
      configApi.updateFlag(flagId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
