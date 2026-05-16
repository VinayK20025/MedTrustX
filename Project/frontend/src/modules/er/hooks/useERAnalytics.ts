'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { erApi, type ERFilters } from '../services/er.api';

const KEYS = {
  all: ['er'] as const,
  summary: (f: ERFilters) => [...KEYS.all, 'summary', f] as const,
};

/** 10-second polling for life-critical ER updates */
export function useERDashboard(filters: ERFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => erApi.getDashboardSummary(filters),
    staleTime: 10_000,
    refetchInterval: 10_000,
  });
}

export function useAcknowledgeERAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => erApi.acknowledgeAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
