import { useAutoApi } from '@/hooks/useAutoApi';

export function useAiGovernance() {
  const api = useAutoApi().aiGovernanceExplainability;
  
  return {
    useModels: (params?: any) => api.useList({ ...params, type: 'model' }),
    useDecisions: (params?: any) => api.useList({ ...params, type: 'decision' }),
    useReports: (params?: any) => api.useList({ ...params, type: 'explainability' }),
    useBiasMetrics: (params?: any) => api.useList({ ...params, type: 'bias' }),
    usePolicies: (params?: any) => api.useList({ ...params, type: 'policy' }),
  };
}
