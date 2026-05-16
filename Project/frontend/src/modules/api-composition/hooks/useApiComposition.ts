import { useAutoApi } from '@/hooks/useAutoApi';

export function useApiComposition() {
  const api = useAutoApi().apiCompositionGateway;
  
  return {
    useCompositions: (params?: any) => api.useList({ ...params, type: 'composition' }),
    useRoutes: (params?: any) => api.useList({ ...params, type: 'route' }),
    useLogs: (params?: any) => api.useList({ ...params, type: 'log' }),
  };
}
