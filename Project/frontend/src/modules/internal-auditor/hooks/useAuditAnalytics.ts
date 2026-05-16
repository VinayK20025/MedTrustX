import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditApi, type AuditFilters } from '../services/audit.api';
import { QUERY_CONFIG } from '@/utils/constants';

export const useAuditDashboard = (filters: AuditFilters = {}) => {
  return useQuery({
    queryKey: ['auditDashboard', filters],
    queryFn: () => auditApi.getDashboardData(filters),
    staleTime: QUERY_CONFIG.STALE_TIME,
    refetchInterval: QUERY_CONFIG.REFETCH_INTERVAL,
  });
};

export const useUpdateFindingStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => auditApi.updateFindingStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auditDashboard'] }),
  });
};

export const useCloseCapaAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => auditApi.closeCapaAction(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auditDashboard'] }),
  });
};
