import { useAutoApi } from '@/hooks/useAutoApi';

export function useRiskOversight() {
  const api = useAutoApi().enterpriseRiskOversight;
  
  return {
    useRisks: (params?: any) => api.useList({ ...params, type: 'risk' }),
    useAssessments: (params?: any) => api.useList({ ...params, type: 'assessment' }),
    useMitigationPlans: (params?: any) => api.useList({ ...params, type: 'mitigation' }),
    useRiskEvents: (params?: any) => api.useList({ ...params, type: 'event' }),
  };
}
