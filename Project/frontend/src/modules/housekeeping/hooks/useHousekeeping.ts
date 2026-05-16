'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { housekeepingApi } from '../services/housekeeping.api';

const KEYS = {
  all: ['housekeeping'] as const,
  dashboard: ['housekeeping', 'dashboard'] as const,
};

export function useHousekeepingDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => housekeepingApi.getDashboardData(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

export function useUpdateRoomStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, status }: { roomId: string; status: string }) => 
      housekeepingApi.updateRoomStatus(roomId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
