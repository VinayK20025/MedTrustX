import { useAutoApi } from '@/hooks/useAutoApi';

export function useCCTVSurveillance() {
  const api = useAutoApi().cctvSurveillance;
  
  return {
    useCameras: (params?: any) => api.useList({ ...params, type: 'camera' }),
    useStreams: (params?: any) => api.useList({ ...params, type: 'stream' }),
    useRecordings: (params?: any) => api.useList({ ...params, type: 'recording' }),
    useEvents: (params?: any) => api.useList({ ...params, type: 'event' }),
  };
}
