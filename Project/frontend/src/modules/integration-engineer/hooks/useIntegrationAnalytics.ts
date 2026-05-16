import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationApi } from '../services/integration.api';

export const useIntegrationDashboard = () => {
  return useQuery({
    queryKey: ['integrationDashboard'],
    queryFn: () => integrationApi.getDashboardData(),
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000, // 10s for near-realtime message stream
  });
};

export const useRetryMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => integrationApi.retryMessage(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['integrationDashboard'] }),
  });
};

export const useDiscardMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => integrationApi.discardMessage(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['integrationDashboard'] }),
  });
};

export const useToggleRoute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => integrationApi.toggleRoute(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['integrationDashboard'] }),
  });
};
