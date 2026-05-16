import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { automationBotsApi } from '../services/automation-bots.api';

export const useAutomationDashboard = () => useQuery({
  queryKey: ['automationBotsDashboard'],
  queryFn: () => automationBotsApi.getData(),
  staleTime: 5 * 1000, // Frequent updates for bots
  refetchInterval: 5 * 1000,
});

export const usePauseBot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ botId }: { botId: string }) => automationBotsApi.pauseBot(botId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automationBotsDashboard'] }),
  });
};

export const useOverrideAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ actionId }: { actionId: string }) => automationBotsApi.overrideAction(actionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automationBotsDashboard'] }),
  });
};

export const useResolveIncident = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ incidentId }: { incidentId: string }) => automationBotsApi.resolveIncident(incidentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automationBotsDashboard'] }),
  });
};
