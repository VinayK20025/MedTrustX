'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi } from '../services/vendor.api';

const KEYS = {
  all: ['vendor-management'] as const,
  dashboard: ['vendor-management', 'dashboard'] as const,
};

export function useVendorDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => vendorApi.getDashboardData(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

export function useUpdateVendorStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId, status }: { vendorId: string; status: string }) => 
      vendorApi.updateVendorStatus(vendorId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
