'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { complianceApi } from '../services/compliance.api';

const KEYS = {
  all: ['compliance'] as const,
  dashboard: ['compliance', 'dashboard'] as const,
};

export function useComplianceDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => complianceApi.getDashboardData(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

export function useReportNonConformance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nc: any) => complianceApi.reportNonConformance(nc),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
