'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { credentialingApi } from '../services/credentialing.api';

const KEYS = {
  all: ['credentialing'] as const,
  dashboard: ['credentialing', 'dashboard'] as const,
};

export function useCredentialingDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => credentialingApi.getDashboardData(),
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useVerifyCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (credentialId: string) => credentialingApi.verifyCredential(credentialId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
