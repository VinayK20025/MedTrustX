'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { caseApi } from '../services/case.api';

const KEYS = {
  all: ['case-management'] as const,
  dashboard: ['case-management', 'dashboard'] as const,
};

export function useCaseDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => caseApi.getDashboardData(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

export function useUpdateDischargeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, status }: { caseId: string; status: string }) => 
      caseApi.updateDischargeStatus(caseId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
