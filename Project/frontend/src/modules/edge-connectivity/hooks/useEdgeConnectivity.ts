import { useAutoApi } from '@/hooks/useAutoApi';

export function useEdgeConnectivity() {
  const api = useAutoApi().edgeConnectivityManager;
  
  return {
    useNodes: (params?: any) => api.useList({ ...params, type: 'node' }),
    useSessions: (params?: any) => api.useList({ ...params, type: 'session' }),
    useLinkMetrics: (params?: any) => api.useList({ ...params, type: 'metric' }),
    useSyncLogs: (params?: any) => api.useList({ ...params, type: 'sync' }),
  };
}
