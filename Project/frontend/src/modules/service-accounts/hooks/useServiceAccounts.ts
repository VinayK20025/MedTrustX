import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceAccountsApi } from '../services/service-accounts.api';

export const useServiceAccountsDashboard = () => useQuery({
  queryKey: ['serviceAccountsDashboard'],
  queryFn: () => serviceAccountsApi.getData(),
  staleTime: 10 * 1000,
  refetchInterval: 15 * 1000,
});

export const useRotateCredential = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ accountId }: { accountId: string }) => serviceAccountsApi.rotateCredential(accountId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['serviceAccountsDashboard'] }),
  });
};

export const useSuspendAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ accountId }: { accountId: string }) => serviceAccountsApi.suspendAccount(accountId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['serviceAccountsDashboard'] }),
  });
};

export const useResolveAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ alertId }: { alertId: string }) => serviceAccountsApi.resolveAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['serviceAccountsDashboard'] }),
  });
};
