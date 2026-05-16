import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { informaticistApi } from '../services/informaticist.api';

export const useInformaticistDashboard = () => useQuery({
  queryKey: ['informaticistDashboard'],
  queryFn: () => informaticistApi.getData(),
  staleTime: 30 * 1000,
  refetchInterval: 30 * 1000,
});

export const useDismissAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => informaticistApi.dismissAlert(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['informaticistDashboard'] }),
  });
};

export const useTuneCDSSRule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => informaticistApi.tuneCDSSRule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['informaticistDashboard'] }),
  });
};
