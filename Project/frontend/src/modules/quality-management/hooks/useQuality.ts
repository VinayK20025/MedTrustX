'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qualityApi } from '../services/quality.api';

const KEYS = {
  all: ['quality'] as const,
  dashboard: ['quality', 'dashboard'] as const,
};

export function useQualityDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => qualityApi.getDashboardData(),
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useReportIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (incident: any) => qualityApi.reportIncident(incident),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
