'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { governanceApi } from '../services/governance.api';

const KEYS = {
  all: ['governance'] as const,
  dashboard: ['governance', 'dashboard'] as const,
};

export function useGovernanceDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => governanceApi.getDashboardData(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

export function useUpdatePolicyStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ policyId, status }: { policyId: string; status: string }) => 
      governanceApi.updatePolicyStatus(policyId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
