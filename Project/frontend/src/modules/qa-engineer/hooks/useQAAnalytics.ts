import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qaApi } from '../services/qa.api';

export const useQADashboard = () => useQuery({
  queryKey: ['qaDashboard'],
  queryFn: () => qaApi.getData(),
  staleTime: 30 * 1000,
  refetchInterval: 30 * 1000,
});

export const useRunSuite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => qaApi.runSuite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['qaDashboard'] }),
  });
};
