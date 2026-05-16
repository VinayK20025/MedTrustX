import { useAutoApi } from '@/hooks/useAutoApi';

export function useCoturn() {
  const api = useAutoApi().coturnRelay;

  return {
    useSessions:     (params?: any) => api.useList({ ...params, type: 'turn_session' }),
    useCredentials:  (params?: any) => api.useList({ ...params, type: 'turn_credential' }),
    useUsageLogs:    (params?: any) => api.useList({ ...params, type: 'relay_usage_log' }),
  };
}
