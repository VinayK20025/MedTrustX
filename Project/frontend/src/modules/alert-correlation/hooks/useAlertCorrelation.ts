import { useAutoApi } from '@/hooks/useAutoApi';

export function useAlertCorrelation() {
  const api = useAutoApi().alertCorrelationEngine;
  
  return {
    useAlerts: (params?: any) => api.useList({ ...params, type: 'alert' }),
    useIncidents: (params?: any) => api.useList({ ...params, type: 'incident' }),
    useMappings: (params?: any) => api.useList({ ...params, type: 'mapping' }),
    useRules: (params?: any) => api.useList({ ...params, type: 'rule' }),
  };
}
