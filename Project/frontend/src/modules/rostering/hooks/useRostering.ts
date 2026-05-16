'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rosteringApi } from '../services/rostering.api';

const KEYS = {
  all: ['rostering'] as const,
  dashboard: ['rostering', 'dashboard'] as const,
};

export function useRosteringDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => rosteringApi.getDashboardData(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

export function useUpdateShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ shiftId, updates }: { shiftId: string; updates: any }) => 
      rosteringApi.updateShift(shiftId, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
