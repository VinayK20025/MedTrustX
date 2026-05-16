import { useAutoApi } from '@/hooks/useAutoApi';

export function useLegalRiskAnalytics() {
  const api = useAutoApi().legalRiskAnalytics;
  
  return {
    useRiskScores: (params?: any) => api.useList({ ...params, type: 'score' }),
    useRiskFactors: (params?: any) => api.useList({ ...params, type: 'factor' }),
    useTrends: (params?: any) => api.useList({ ...params, type: 'trend' }),
    usePredictiveModels: (params?: any) => api.useList({ ...params, type: 'model' }),
  };
}
