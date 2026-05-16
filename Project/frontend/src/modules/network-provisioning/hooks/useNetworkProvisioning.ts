import { useAutoApi } from '@/hooks/useAutoApi';

export function useNetworkProvisioning() {
  const api = useAutoApi().networkProvisioning;
  
  return {
    useNetworks: (params?: any) => api.useList({ ...params, type: 'network' }),
    useSubnets: (params?: any) => api.useList({ ...params, type: 'subnet' }),
    useIPAllocations: (params?: any) => api.useList({ ...params, type: 'ip' }),
    useDevices: (params?: any) => api.useList({ ...params, type: 'device' }),
  };
}
