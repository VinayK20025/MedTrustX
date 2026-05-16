'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { insuranceApi } from '../services/insurance.api';

const KEYS = {
  all: ['insurance'] as const,
  dashboard: ['insurance', 'dashboard'] as const,
};

export function useInsuranceDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => insuranceApi.getDashboardData(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

export function useVerifyEligibility() {
  return useMutation({
    mutationFn: ({ patientId, payerId }: { patientId: string; payerId: string }) => 
      insuranceApi.verifyEligibility(patientId, payerId),
  });
}
