'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketingApi, type MarketingFilters } from '../services/marketing.api';

const KEYS = {
  all: ['marketing'] as const,
  summary: (filters: MarketingFilters) => [...KEYS.all, 'summary', filters] as const,
};

/** 2-minute polling — marketing data is analytical, campaign-cycle driven */
export function useMarketingDashboard(filters: MarketingFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => marketingApi.getDashboardSummary(filters),
    staleTime: 120_000,
    refetchInterval: 120_000,
  });
}

export function usePauseCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) => marketingApi.pauseCampaign(campaignId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useResolveMarketingAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => marketingApi.resolveAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
