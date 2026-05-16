'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { riskApi } from '../services/risk.api';

const KEYS = {
  all: ['risk-management'] as const,
  dashboard: ['risk-management', 'dashboard'] as const,
};

export function useRiskDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => riskApi.getDashboardData(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

export function useUpdateRiskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ riskId, status }: { riskId: string; status: string }) => 
      riskApi.updateRiskStatus(riskId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
