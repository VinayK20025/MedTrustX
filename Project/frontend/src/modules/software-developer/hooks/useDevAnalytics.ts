import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { developerApi, type DevFilters } from '../services/developer.api';

export const useDevDashboard = (filters: DevFilters = {}) => {
  return useQuery({
    queryKey: ['devDashboard', filters],
    queryFn: () => developerApi.getDashboardData(filters),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
};

export const useRunTests = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ suiteId }: { suiteId: string }) => developerApi.runTests(suiteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['devDashboard'] }),
  });
};

export const useTriggerBuild = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId }: { serviceId: string }) => developerApi.triggerBuild(serviceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['devDashboard'] }),
  });
};

export const useResolveIssue = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ issueId }: { issueId: string }) => developerApi.resolveIssue(issueId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['devDashboard'] }),
  });
};
