import { useAutoApi } from '@/hooks/useAutoApi';

export function useSecurityIncident() {
  const api = useAutoApi().securityIncidentResponse;
  
  return {
    useIncidents: (params?: any) => api.useList({ ...params, type: 'incident' }),
    useActions: (params?: any) => api.useList({ ...params, type: 'action' }),
    useResponders: (params?: any) => api.useList({ ...params, type: 'responder' }),
    useLogs: (params?: any) => api.useList({ ...params, type: 'log' }),
  };
}
