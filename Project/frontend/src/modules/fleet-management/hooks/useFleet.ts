'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fleetApi } from '../services/fleet.api';

const KEYS = {
  all: ['fleet-management'] as const,
  dashboard: ['fleet-management', 'dashboard'] as const,
};

export function useFleetDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => fleetApi.getDashboardData(),
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useDispatchVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ vehicleId, data }: { vehicleId: string; data: any }) => 
      fleetApi.dispatchVehicle(vehicleId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
