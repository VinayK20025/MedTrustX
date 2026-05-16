import { useAutoApi } from '@/hooks/useAutoApi';

export function usePrometheus() {
  const api = useAutoApi().prometheusMonitoring;

  return {
    useMetrics: (params?: any) => api.useList({ ...params, type: 'metric_series' }),
    useAlertRules: (params?: any) => api.useList({ ...params, type: 'alert_rule' }),
    useAlertEvents: (params?: any) => api.useList({ ...params, type: 'alert_event' }),
  };
}
