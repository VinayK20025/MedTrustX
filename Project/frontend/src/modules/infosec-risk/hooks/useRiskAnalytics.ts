import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { riskApi, type RiskFilters } from '../services/infosec-risk.api';
import { QUERY_CONFIG } from '@/utils/constants';

export const useRiskDashboard = (filters: RiskFilters = {}) => {
  return useQuery({
    queryKey: ['riskDashboard', filters],
    queryFn: () => riskApi.getDashboardData(filters),
    staleTime: QUERY_CONFIG.STALE_TIME,
    refetchInterval: QUERY_CONFIG.REFETCH_INTERVAL,
  });
};

export const useUpdateRiskStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ riskId, status }: { riskId: string; status: string }) =>
      riskApi.updateRiskStatus(riskId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['riskDashboard'] }),
  });
};

export const useAddMitigation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ riskId, action, assignee }: { riskId: string; action: string; assignee: string }) =>
      riskApi.addMitigation(riskId, action, assignee),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['riskDashboard'] }),
  });
};
