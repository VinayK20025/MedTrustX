import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dpoApi, type DpoFilters } from '../services/dpo.api';
import { QUERY_CONFIG } from '@/utils/constants';

export const useDpoDashboard = (filters: DpoFilters = {}) => {
  return useQuery({
    queryKey: ['dpoDashboard', filters],
    queryFn: () => dpoApi.getDashboardData(filters),
    staleTime: QUERY_CONFIG.STALE_TIME,
    refetchInterval: QUERY_CONFIG.REFETCH_INTERVAL,
  });
};

export const useUpdateRequestStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => dpoApi.updateRequestStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dpoDashboard'] }),
  });
};

export const useUpdateBreachStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => dpoApi.updateBreachStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dpoDashboard'] }),
  });
};

export const useUpdateConsentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => dpoApi.updateConsentStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dpoDashboard'] }),
  });
};
