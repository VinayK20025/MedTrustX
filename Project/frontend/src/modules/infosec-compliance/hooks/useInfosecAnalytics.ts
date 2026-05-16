import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { infosecApi, type GrcFilters } from '../services/infosec.api';
import { QUERY_CONFIG } from '@/utils/constants';

export const useInfosecDashboard = (filters: GrcFilters = {}) => {
  return useQuery({
    queryKey: ['infosecDashboard', filters],
    queryFn: () => infosecApi.getDashboardData(filters),
    staleTime: QUERY_CONFIG.STALE_TIME,
    refetchInterval: QUERY_CONFIG.REFETCH_INTERVAL,
  });
};

export const useUpdateControlStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ controlId, status }: { controlId: string; status: string }) => 
      infosecApi.updateControlStatus(controlId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infosecDashboard'] });
    },
  });
};

export const useAddRiskEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, severity }: { title: string; severity: string }) => 
      infosecApi.addRiskEntry(title, severity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infosecDashboard'] });
    },
  });
};
