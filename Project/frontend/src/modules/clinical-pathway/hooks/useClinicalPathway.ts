import { useAutoApi } from '@/hooks/useAutoApi';

export function useClinicalPathway() {
  const api = useAutoApi().clinicalPathwayIntelligence;
  
  return {
    usePathways: (params?: any) => api.useList({ ...params, type: 'pathway' }),
    useSteps: (params?: any) => api.useList({ ...params, type: 'step' }),
    useJourneys: (params?: any) => api.useList({ ...params, type: 'journey' }),
    useVariances: (params?: any) => api.useList({ ...params, type: 'variance' }),
  };
}
