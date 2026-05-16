'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { popHealthApi } from '../services/pophealth.api';

const KEYS = {
  all: ['populationHealth'] as const,
  dashboard: ['populationHealth', 'dashboard'] as const,
};

export function usePopHealthDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => popHealthApi.getDashboardData(),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useUpdateCampaignStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ campaignId, status }: { campaignId: string; status: string }) => 
      popHealthApi.updateCampaignStatus(campaignId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
