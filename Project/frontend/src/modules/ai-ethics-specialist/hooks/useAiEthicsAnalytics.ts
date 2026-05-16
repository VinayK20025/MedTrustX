import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiEthicsApi } from '../services/ai-ethics.api';

export const useAiEthicsDashboard = () => useQuery({
  queryKey: ['aiEthicsDashboard'],
  queryFn: () => aiEthicsApi.getData(),
  staleTime: 30 * 1000,
  refetchInterval: 30 * 1000,
});

export const useBlockModel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => aiEthicsApi.blockModel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aiEthicsDashboard'] }),
  });
};

export const useApproveModel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => aiEthicsApi.approveModel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aiEthicsDashboard'] }),
  });
};

export const useDismissEthicsAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => aiEthicsApi.dismissAlert(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aiEthicsDashboard'] }),
  });
};
