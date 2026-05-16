import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { securityEngineerApi } from '../services/security-engineer.api';

export const useSecurityEngineerDashboard = () => useQuery({
  queryKey: ['securityEngineerDashboard'],
  queryFn: () => securityEngineerApi.getData(),
  staleTime: 10 * 1000,
  refetchInterval: 10 * 1000,
});

export const useToggleFirewallRule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId }: { ruleId: string }) => securityEngineerApi.toggleFirewallRule(ruleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['securityEngineerDashboard'] }),
  });
};

export const useQuarantineEndpoint = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ endpointId }: { endpointId: string }) => securityEngineerApi.quarantineEndpoint(endpointId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['securityEngineerDashboard'] }),
  });
};

export const useEnforcePolicyMode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ policyId, mode }: { policyId: string; mode: string }) => securityEngineerApi.enforcePolicyMode(policyId, mode),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['securityEngineerDashboard'] }),
  });
};
