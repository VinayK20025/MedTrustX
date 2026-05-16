import { useAutoApi } from '@/hooks/useAutoApi';

export function useSlaHealth() {
  const api = useAutoApi().slaHealthManager;
  
  return {
    useDefinitions: (params?: any) => api.useList({ ...params, type: 'sla' }),
    useHealthStatus: (params?: any) => api.useList({ ...params, type: 'health' }),
    useViolations: (params?: any) => api.useList({ ...params, type: 'violation' }),
    useEvents: (params?: any) => api.useList({ ...params, type: 'event' }),
  };
}
