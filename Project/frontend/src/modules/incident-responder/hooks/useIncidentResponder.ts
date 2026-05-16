import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentResponderApi } from '../services/incident-responder.api';

export const useIncidentResponderDashboard = () => useQuery({
  queryKey: ['incidentResponderDashboard'],
  queryFn: () => incidentResponderApi.getData(),
  staleTime: 5 * 1000,
  refetchInterval: 5 * 1000,
});

export const useExecuteAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ actionId }: { actionId: string }) => incidentResponderApi.executeAction(actionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incidentResponderDashboard'] }),
  });
};

export const useUpdatePhase = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ incidentId, phase }: { incidentId: string; phase: string }) => incidentResponderApi.updatePhase(incidentId, phase),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incidentResponderDashboard'] }),
  });
};

export const useContainSystem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ incidentId, system }: { incidentId: string; system: string }) => incidentResponderApi.containSystem(incidentId, system),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incidentResponderDashboard'] }),
  });
};
