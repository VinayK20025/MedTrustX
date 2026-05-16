import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bloodBankTechApi, type TechFilters } from '../services/blood-bank-tech.api';
import { QUERY_CONFIG } from '@/utils/constants';

export const useBloodBankTechDashboard = (filters: TechFilters = {}) => {
  return useQuery({
    queryKey: ['bloodBankTechDashboard', filters],
    queryFn: () => bloodBankTechApi.getDashboardData(filters),
    staleTime: QUERY_CONFIG.STALE_TIME,
    refetchInterval: QUERY_CONFIG.REFETCH_INTERVAL,
  });
};

export const useRecordScreening = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ screeningId, result }: { screeningId: string; result: 'Negative' | 'Positive' | 'Invalid' }) => 
      bloodBankTechApi.recordScreeningResult(screeningId, result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodBankTechDashboard'] });
    },
  });
};

export const usePerformCrossmatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, unitIds }: { requestId: string; unitIds: string[] }) => 
      bloodBankTechApi.performCrossmatch(requestId, unitIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodBankTechDashboard'] });
    },
  });
};

export const useUpdateUnitStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ unitId, status, location }: { unitId: string; status: string; location: string }) => 
      bloodBankTechApi.updateUnitStatus(unitId, status, location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodBankTechDashboard'] });
    },
  });
};
