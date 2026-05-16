import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { devopsApi, type DevOpsFilters } from '../services/devops.api';
import { QUERY_CONFIG } from '@/utils/constants';

export const useDevOpsDashboard = (filters: DevOpsFilters = {}) => {
  return useQuery({
    queryKey: ['devopsDashboard', filters],
    queryFn: () => devopsApi.getDashboardData(filters),
    staleTime: 15 * 1000, // 15s for near-realtime feel
    refetchInterval: 15 * 1000,
  });
};

export const useTriggerPipeline = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => devopsApi.triggerPipeline(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['devopsDashboard'] }),
  });
};

export const useRollbackDeployment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => devopsApi.rollbackDeployment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['devopsDashboard'] }),
  });
};

export const useAcknowledgeAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => devopsApi.acknowledgeAlert(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['devopsDashboard'] }),
  });
};
