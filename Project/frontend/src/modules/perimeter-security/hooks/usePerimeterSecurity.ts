import { useAutoApi } from '@/hooks/useAutoApi';

export function usePerimeterSecurity() {
  const api = useAutoApi().perimeterSecurity;
  
  return {
    useZones: (params?: any) => api.useList({ ...params, type: 'zone' }),
    useSensors: (params?: any) => api.useList({ ...params, type: 'sensor' }),
    useIntrusions: (params?: any) => api.useList({ ...params, type: 'intrusion' }),
    useResponses: (params?: any) => api.useList({ ...params, type: 'response' }),
  };
}
