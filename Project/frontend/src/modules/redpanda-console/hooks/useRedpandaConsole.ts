import { useAutoApi } from '@/hooks/useAutoApi';

export function useRedpandaConsole() {
  const api = useAutoApi().redpandaConsole;
  
  return {
    useSessions: (params?: any) => api.useList({ ...params, type: 'session' }),
    useTopics: (params?: any) => api.useList({ ...params, type: 'topic' }),
    useConsumerGroups: (params?: any) => api.useList({ ...params, type: 'consumer_group' }),
  };
}
