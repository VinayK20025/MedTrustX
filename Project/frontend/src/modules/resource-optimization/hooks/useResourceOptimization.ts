import { useAutoApi } from '@/hooks/useAutoApi';

export function useResourceOptimization() {
  const api = useAutoApi().resourceOptimizationEngine;
  
  return {
    useResources: (params?: any) => api.useList({ ...params, type: 'resource' }),
    useAllocations: (params?: any) => api.useList({ ...params, type: 'allocation' }),
    useRuns: (params?: any) => api.useList({ ...params, type: 'run' }),
    useResults: (params?: any) => api.useList({ ...params, type: 'result' }),
  };
}
