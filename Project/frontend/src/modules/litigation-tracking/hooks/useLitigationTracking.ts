import { useAutoApi } from '@/hooks/useAutoApi';

export function useLitigationTracking() {
  const api = useAutoApi().litigationTracking;
  
  return {
    useLitigations: (params?: any) => api.useList({ ...params, type: 'litigation' }),
    useHearings: (params?: any) => api.useList({ ...params, type: 'hearing' }),
    useParties: (params?: any) => api.useList({ ...params, type: 'party' }),
    useUpdates: (params?: any) => api.useList({ ...params, type: 'update' }),
  };
}
