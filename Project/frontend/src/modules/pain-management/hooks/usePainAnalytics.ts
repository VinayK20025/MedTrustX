import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { painApi, type PainFilters } from '../services/pain-management.api';
import { QUERY_CONFIG } from '@/utils/constants';

export const usePainDashboard = (filters: PainFilters = {}) => {
  return useQuery({
    queryKey: ['painDashboard', filters],
    queryFn: () => painApi.getDashboardData(filters),
    staleTime: QUERY_CONFIG.STALE_TIME,
    refetchInterval: QUERY_CONFIG.REFETCH_INTERVAL,
  });
};

export const useUpdatePainScore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, score }: { patientId: string; score: number }) => 
      painApi.updatePainScore(patientId, score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painDashboard'] });
    },
  });
};

export const useScheduleProcedure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, type, date }: { patientId: string; type: string; date: string }) => 
      painApi.scheduleProcedure(patientId, type, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painDashboard'] });
    },
  });
};
