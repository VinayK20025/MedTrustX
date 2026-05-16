'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gatewayApi } from '../services/gateway.api';

const KEYS = {
  all:       ['kongGateway'] as const,
  dashboard: ['kongGateway', 'dashboard'] as const,
  services:  ['kongGateway', 'services'] as const,
};

export const useGatewayDashboard = () => useQuery({
  queryKey: KEYS.dashboard,
  queryFn:  () => gatewayApi.getDashboardData(),
  staleTime: 10_000,
  refetchInterval: 15_000,
});

export const useKongServices = () => useQuery({
  queryKey: KEYS.services,
  queryFn:  () => gatewayApi.getKongServices(),
  staleTime: 15_000,
});

export const useTogglePlugin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pluginId, enabled }: { pluginId: string; enabled: boolean }) =>
      gatewayApi.togglePlugin(pluginId, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
};

export const useBlockConsumer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (consumerId: string) => gatewayApi.blockConsumer(consumerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
};

export const useAcknowledgeGatewayAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => gatewayApi.acknowledgeAlert(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
};
