'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tfServingApi } from '../services/tfserving.api';

const KEYS = {
  all: ['tfServing'] as const,
  dashboard: ['tfServing', 'dashboard'] as const,
};

export function useTfServingDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => tfServingApi.getDashboardData(),
    staleTime: 5000,
    refetchInterval: 10000,
  });
}

export function useReloadModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (modelName: string) => tfServingApi.reloadModel(modelName),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
