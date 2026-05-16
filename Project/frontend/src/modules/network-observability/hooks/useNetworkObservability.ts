import { useAutoApi } from '@/hooks/useAutoApi';

export function useNetworkObservability() {
  const api = useAutoApi().networkObservability;
  
  return {
    useFlows: (params?: any) => api.useList({ ...params, type: 'flow' }),
    useTrafficMetrics: (params?: any) => api.useList({ ...params, type: 'metric' }),
    useDependencies: (params?: any) => api.useList({ ...params, type: 'dependency' }),
    useAnomalies: (params?: any) => api.useList({ ...params, type: 'anomaly' }),
  };
}
