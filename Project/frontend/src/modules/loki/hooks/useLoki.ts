import { useAutoApi } from '@/hooks/useAutoApi';

export function useLoki() {
  const api = useAutoApi().lokiLogging;

  return {
    useStreams: (params?: any) => api.useList({ ...params, type: 'stream' }),
    useEntries: (params?: any) => api.useList({ ...params, type: 'entry' }),
    useIndex: (params?: any) => api.useList({ ...params, type: 'index' }),
  };
}
