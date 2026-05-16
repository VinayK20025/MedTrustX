import { useAutoApi } from '@/hooks/useAutoApi';

export function useRedpanda() {
  const api = useAutoApi().redpandaStreaming;

  return {
    useTopics:          (params?: any) => api.useList({ ...params }),
    useMessages:        (params?: any) => api.useList({ ...params, type: 'message' }),
    useConsumerOffsets: (params?: any) => api.useList({ ...params, type: 'consumer_offset' }),
  };
}
