import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { threatIntelApi } from '../services/threat-intel.api';

export const useThreatIntelDashboard = () => useQuery({
  queryKey: ['threatIntelDashboard'],
  queryFn: () => threatIntelApi.getData(),
  staleTime: 10 * 1000,
  refetchInterval: 10 * 1000,
});

export const usePushDetectionRule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId }: { ruleId: string }) => threatIntelApi.pushDetectionRule(ruleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['threatIntelDashboard'] }),
  });
};

export const useEnrichIoc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ iocId }: { iocId: string }) => threatIntelApi.enrichIoc(iocId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['threatIntelDashboard'] }),
  });
};

export const useToggleFeed = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ feedId }: { feedId: string }) => threatIntelApi.toggleFeed(feedId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['threatIntelDashboard'] }),
  });
};
