import { useAutoApi } from '@/hooks/useAutoApi';

export function useSonarQube() {
  const api = useAutoApi().sonarqubeQuality;
  
  return {
    useProjects: (params?: any) => api.useList({ ...params, type: 'project' }),
    useAnalyses: (params?: any) => api.useList({ ...params, type: 'analysis' }),
    useIssues: (params?: any) => api.useList({ ...params, type: 'issue' }),
    useQualityGates: (params?: any) => api.useList({ ...params, type: 'quality_gate' }),
  };
}
