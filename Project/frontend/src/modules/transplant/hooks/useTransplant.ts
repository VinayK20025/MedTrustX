'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transplantApi } from '../services/transplant.api';

const KEYS = {
  all: ['transplant'] as const,
  dashboard: ['transplant', 'dashboard'] as const,
};

export function useTransplantDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => transplantApi.getDashboardData(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

export function useProposeMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ recipientId, donorId }: { recipientId: string; donorId: string }) => 
      transplantApi.proposeMatch(recipientId, donorId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
