import { useAutoApi } from '@/hooks/useAutoApi';

export function useRedis() {
  const api = useAutoApi().redisCache;

  return {
    useCacheKeys:    (params?: any) => api.useList({ ...params, type: 'cache_key' }),
    useSessions:     (params?: any) => api.useList({ ...params, type: 'session_store' }),
    useRateLimits:   (params?: any) => api.useList({ ...params, type: 'rate_limit' }),
  };
}
