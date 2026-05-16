import { useAutoApi } from '@/hooks/useAutoApi';

export function usePerformanceIntelligence() {
  const api = useAutoApi().performanceIntelligence;
  
  return {
    useMetrics: (params?: any) => api.useList({ ...params, type: 'metric' }),
    useBenchmarks: (params?: any) => api.useList({ ...params, type: 'benchmark' }),
    useScores: (params?: any) => api.useList({ ...params, type: 'score' }),
    useInsights: (params?: any) => api.useList({ ...params, type: 'insight' }),
  };
}
