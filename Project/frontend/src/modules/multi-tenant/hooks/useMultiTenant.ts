import { useAutoApi } from '@/hooks/useAutoApi';

export function useMultiTenant() {
  const api = useAutoApi().multiTenantIsolationManager;
  
  return {
    useTenants: (params?: any) => api.useList({ ...params, type: 'tenant' }),
    usePolicies: (params?: any) => api.useList({ ...params, type: 'policy' }),
    useLogs: (params?: any) => api.useList({ ...params, type: 'log' }),
    usePropagations: (params?: any) => api.useList({ ...params, type: 'propagation' }),
  };
}
