import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socAnalystApi } from '../services/soc-analyst.api';

export const useSocDashboard = () => useQuery({
  queryKey: ['socDashboard'],
  queryFn: () => socAnalystApi.getData(),
  staleTime: 5 * 1000, // Frequent updates for alerts
  refetchInterval: 5 * 1000,
});

export const useExecutePlaybook = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playbookId }: { playbookId: string }) => socAnalystApi.executePlaybook(playbookId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['socDashboard'] }),
  });
};

export const useUpdateIncidentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ incidentId, status }: { incidentId: string, status: string }) => socAnalystApi.updateIncidentStatus(incidentId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['socDashboard'] }),
  });
};

export const useAssignAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ alertId }: { alertId: string }) => socAnalystApi.assignAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['socDashboard'] }),
  });
};
