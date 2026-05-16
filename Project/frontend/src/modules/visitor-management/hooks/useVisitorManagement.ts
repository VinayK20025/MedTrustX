import { useAutoApi } from '@/hooks/useAutoApi';

export function useVisitorManagement() {
  const api = useAutoApi().visitorManagement;
  
  return {
    useVisitors: (params?: any) => api.useList({ ...params, type: 'visitor' }),
    useVisits: (params?: any) => api.useList({ ...params, type: 'visit' }),
    useBadges: (params?: any) => api.useList({ ...params, type: 'badge' }),
    useVisitLogs: (params?: any) => api.useList({ ...params, type: 'log' }),
  };
}
