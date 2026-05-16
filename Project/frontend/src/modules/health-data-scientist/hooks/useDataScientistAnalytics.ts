import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataScientistApi } from '../services/data-scientist.api';

export const useDataScientistDashboard = () => useQuery({
  queryKey: ['dataScientistDashboard'],
  queryFn: () => dataScientistApi.getData(),
  staleTime: 30 * 1000,
  refetchInterval: 30 * 1000,
});

export const useRetrainPredictiveModel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => dataScientistApi.retrainModel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dataScientistDashboard'] }),
  });
};

export const useExportCohort = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => dataScientistApi.exportCohort(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dataScientistDashboard'] }),
  });
};
