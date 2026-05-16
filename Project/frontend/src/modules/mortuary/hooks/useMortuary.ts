'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mortuaryApi } from '../services/mortuary.api';

const KEYS = {
  all: ['mortuary'] as const,
  dashboard: ['mortuary', 'dashboard'] as const,
};

export function useMortuaryDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => mortuaryApi.getDashboardData(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

export function useUpdateChamber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ chamberId, status }: { chamberId: string; status: string }) => 
      mortuaryApi.updateChamberStatus(chamberId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
