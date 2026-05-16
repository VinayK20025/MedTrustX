import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mlApi } from '../services/ml.api';

export const useMlDashboard = () => useQuery({
  queryKey: ['mlEngineerDashboard'],
  queryFn: () => mlApi.getData(),
  staleTime: 30 * 1000,
  refetchInterval: 30 * 1000,
});

export const useRetrainModel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => mlApi.retrainModel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mlEngineerDashboard'] }),
  });
};

export const useAcknowledgeMlAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => mlApi.acknowledgeAlert(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mlEngineerDashboard'] }),
  });
};
