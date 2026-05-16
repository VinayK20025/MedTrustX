import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataApi } from '../services/data.api';

export const useDataDashboard = () => useQuery({
  queryKey: ['dataEngineerDashboard'],
  queryFn: () => dataApi.getData(),
  staleTime: 15 * 1000,
  refetchInterval: 15 * 1000,
});

export const useRetryPipeline = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => dataApi.retryPipeline(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dataEngineerDashboard'] }),
  });
};

export const useAcknowledgeDataAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => dataApi.acknowledgeAlert(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dataEngineerDashboard'] }),
  });
};
