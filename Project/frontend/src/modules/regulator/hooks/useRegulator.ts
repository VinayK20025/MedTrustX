'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { regulatorApi } from '../services/regulator.api';

const KEYS = {
  all: ['regulator'] as const,
  dashboard: ['regulator', 'dashboard'] as const,
};

export function useRegulatorDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => regulatorApi.getDashboardData(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

export function useAcknowledgeDirective() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (directiveId: string) => regulatorApi.acknowledgeDirective(directiveId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
