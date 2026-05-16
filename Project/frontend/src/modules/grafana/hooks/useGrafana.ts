import { useAutoApi } from '@/hooks/useAutoApi';

export function useGrafana() {
  const api = useAutoApi().grafanaVisualization;

  return {
    useDashboards: (params?: any) => api.useList({ ...params, type: 'dashboard' }),
    usePanels: (params?: any) => api.useList({ ...params, type: 'panel' }),
    useDataSources: (params?: any) => api.useList({ ...params, type: 'datasource' }),
    useAlertVisualizations: (params?: any) => api.useList({ ...params, type: 'alert_visualization' }),
  };
}
