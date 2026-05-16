import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { geneticApi, type GeneticFilters } from '../services/genetic.api';
import { QUERY_CONFIG } from '@/utils/constants';

export const useGeneticDashboard = (filters: GeneticFilters = {}) => {
  return useQuery({
    queryKey: ['geneticDashboard', filters],
    queryFn: () => geneticApi.getDashboardData(filters),
    staleTime: QUERY_CONFIG.STALE_TIME,
    refetchInterval: QUERY_CONFIG.REFETCH_INTERVAL,
  });
};

export const useLogCounselingSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, summary, recommendations }: { patientId: string; summary: string; recommendations: string[] }) => 
      geneticApi.logSession(patientId, summary, recommendations),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geneticDashboard'] });
    },
  });
};

export const useUpdateRiskLevel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, level }: { patientId: string; level: string }) => 
      geneticApi.updateRiskLevel(patientId, level),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geneticDashboard'] });
    },
  });
};
