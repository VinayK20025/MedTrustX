import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analystApi } from '../services/analyst.api';

export const useAnalystDashboard = () => useQuery({
  queryKey: ['analystDashboard'],
  queryFn: () => analystApi.getData(),
  staleTime: 30 * 1000,
  refetchInterval: 30 * 1000,
});

export const useGenerateReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => analystApi.generateReport(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['analystDashboard'] }),
  });
};

export const useMarkInsightReviewed = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => analystApi.markInsightReviewed(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['analystDashboard'] }),
  });
};
