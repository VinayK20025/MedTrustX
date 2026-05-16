import { useAutoApi } from '@/hooks/useAutoApi';

export function useFireSafety() {
  const api = useAutoApi().fireSafetySystems;
  
  return {
    useDevices: (params?: any) => api.useList({ ...params, type: 'device' }),
    useEvents: (params?: any) => api.useList({ ...params, type: 'event' }),
    useActions: (params?: any) => api.useList({ ...params, type: 'action' }),
    useEvacuationLogs: (params?: any) => api.useList({ ...params, type: 'evacuation' }),
  };
}
