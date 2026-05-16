import { useAutoApi } from '@/hooks/useAutoApi';

export function useStrategicAnalytics() {
  const api = useAutoApi().strategicPlanning;
  
  return {
    usePlans: (params?: any) => api.useList({ ...params, type: 'plan' }),
    useObjectives: (params?: any) => api.useList({ ...params, type: 'objective' }),
    useInitiatives: (params?: any) => api.useList({ ...params, type: 'initiative' }),
    useForecasts: (params?: any) => api.useList({ ...params, type: 'forecast' }),
  };
}
