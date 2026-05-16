import { useAutoApi } from '@/hooks/useAutoApi';

export function useDigitalTwin() {
  const api = useAutoApi().digitalTwinEngine;
  
  return {
    useTwins: (params?: any) => api.useList({ ...params, type: 'twin' }),
    useStates: (params?: any) => api.useList({ ...params, type: 'state' }),
    useEvents: (params?: any) => api.useList({ ...params, type: 'event' }),
    useSimulations: (params?: any) => api.useList({ ...params, type: 'simulation' }),
  };
}
