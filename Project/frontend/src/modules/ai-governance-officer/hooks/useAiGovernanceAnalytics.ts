import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiGovernanceApi } from '../services/ai-governance.api';

export const useAiGovernanceDashboard = () => useQuery({
  queryKey: ['aiGovernanceDashboard'],
  queryFn: () => aiGovernanceApi.getData(),
  staleTime: 30 * 1000,
  refetchInterval: 30 * 1000,
});

export const useApproveGovernanceModel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => aiGovernanceApi.approveModel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aiGovernanceDashboard'] }),
  });
};

export const useRejectGovernanceModel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => aiGovernanceApi.rejectModel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aiGovernanceDashboard'] }),
  });
};

export const useInitiateAudit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => aiGovernanceApi.initiateAudit(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aiGovernanceDashboard'] }),
  });
};
