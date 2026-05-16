import { useAutoApi } from '@/hooks/useAutoApi';

export function useDataFabric() {
  const api = useAutoApi().dataFabricIntegrationHub;
  
  return {
    usePipelines: (params?: any) => api.useList({ ...params, type: 'pipeline' }),
    useTransformations: (params?: any) => api.useList({ ...params, type: 'transformation' }),
    useEvents: (params?: any) => api.useList({ ...params, type: 'event' }),
    useSchemas: (params?: any) => api.useList({ ...params, type: 'schema' }),
  };
}
