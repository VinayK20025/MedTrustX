import { useAutoApi } from '@/hooks/useAutoApi';

export function useJaeger() {
  const api = useAutoApi().jaegerTracing;

  return {
    useTraces: (params?: any) => api.useList({ ...params, type: 'trace' }),
    useSpans: (params?: any) => api.useList({ ...params, type: 'span' }),
    useDependencies: (params?: any) => api.useList({ ...params, type: 'dependency' }),
  };
}
