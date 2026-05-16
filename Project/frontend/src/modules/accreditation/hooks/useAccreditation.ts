'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accreditationApi } from '../services/accreditation.api';

const KEYS = {
  all: ['accreditation'] as const,
  dashboard: ['accreditation', 'dashboard'] as const,
};

export function useAccreditationDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => accreditationApi.getDashboardData(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

export function useUpdateStandardStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ standardId, status }: { standardId: string; status: string }) => 
      accreditationApi.updateStandardStatus(standardId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
