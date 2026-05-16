import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { iomtApi } from '../services/iomt.api';

export const useIomtDashboard = () => useQuery({
  queryKey: ['iomtDashboard'],
  queryFn: () => iomtApi.getData(),
  staleTime: 5 * 1000, // Faster refresh for live data simulation
  refetchInterval: 5 * 1000,
});

export const useRevokeCertificate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ deviceId }: { deviceId: string }) => iomtApi.revokeCertificate(deviceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['iomtDashboard'] }),
  });
};

export const useApproveDevice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ deviceId }: { deviceId: string }) => iomtApi.approveDevice(deviceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['iomtDashboard'] }),
  });
};

export const useResolveAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ alertId }: { alertId: string }) => iomtApi.resolveAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['iomtDashboard'] }),
  });
};
