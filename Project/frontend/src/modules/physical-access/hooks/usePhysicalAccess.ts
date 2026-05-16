import { useAutoApi } from '@/hooks/useAutoApi';

export function usePhysicalAccess() {
  const api = useAutoApi().physicalAccessControl;
  
  return {
    usePoints: (params?: any) => api.useList({ ...params, type: 'access_point' }),
    useCredentials: (params?: any) => api.useList({ ...params, type: 'credential' }),
    usePolicies: (params?: any) => api.useList({ ...params, type: 'access_policy' }),
    useLogs: (params?: any) => api.useList({ ...params, type: 'access_log' }),
  };
}
