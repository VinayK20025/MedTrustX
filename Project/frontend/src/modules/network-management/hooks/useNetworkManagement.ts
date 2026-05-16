import { useAutoApi } from '@/hooks/useAutoApi';

export function useNetworkManagement() {
  const api = useAutoApi().networkManagement;
  
  return {
    useDevices: (params?: any) => api.useList({ ...params, type: 'device' }),
    useMetrics: (params?: any) => api.useList({ ...params, type: 'metric' }),
    useTopology: (params?: any) => api.useList({ ...params, type: 'topology' }),
    useFaults: (params?: any) => api.useList({ ...params, type: 'fault' }),
  };
}
