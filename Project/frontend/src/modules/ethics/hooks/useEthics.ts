'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ethicsApi } from '../services/ethics.api';

const KEYS = {
  all: ['ethics'] as const,
  dashboard: ['ethics', 'dashboard'] as const,
};

export function useEthicsDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => ethicsApi.getDashboardData(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

export function useSubmitConsultation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (consultation: any) => ethicsApi.submitConsultation(consultation),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
