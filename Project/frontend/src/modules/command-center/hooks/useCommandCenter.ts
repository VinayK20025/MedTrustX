import { useAutoApi } from '@/hooks/useAutoApi';

export function useCommandCenter() {
  const api = useAutoApi().operationalCommandCenter;
  
  return {
    useIncidents: (params?: any) => api.useList({ ...params, type: 'incident' }),
    useCommands: (params?: any) => api.useList({ ...params, type: 'command' }),
    useEvents: (params?: any) => api.useList({ ...params, type: 'event' }),
    useSessions: (params?: any) => api.useList({ ...params, type: 'session' }),
  };
}
