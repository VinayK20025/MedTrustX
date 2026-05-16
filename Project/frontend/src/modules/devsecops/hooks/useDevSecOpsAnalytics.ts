import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { devSecOpsApi, type DevSecOpsFilters } from '../services/devsecops.api';

export const useDevSecOpsDashboard = (filters: DevSecOpsFilters = {}) => {
  return useQuery({
    queryKey: ['devSecOpsDashboard', filters],
    queryFn: () => devSecOpsApi.getDashboardData(filters),
    staleTime: 15 * 1000,
    refetchInterval: 15 * 1000,
  });
};

export const useAcceptVulnerability = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => devSecOpsApi.acceptVulnerability(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['devSecOpsDashboard'] }),
  });
};

export const useTogglePolicy = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => devSecOpsApi.togglePolicy(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['devSecOpsDashboard'] }),
  });
};

export const useAcknowledgeSecAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => devSecOpsApi.acknowledgeAlert(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['devSecOpsDashboard'] }),
  });
};
