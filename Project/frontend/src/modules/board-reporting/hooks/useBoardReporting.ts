import { useAutoApi } from '@/hooks/useAutoApi';

export function useBoardReporting() {
  const api = useAutoApi().boardReporting;
  
  return {
    useReports: (params?: any) => api.useList({ ...params, type: 'report' }),
    useSections: (params?: any) => api.useList({ ...params, type: 'section' }),
    useSchedules: (params?: any) => api.useList({ ...params, type: 'schedule' }),
    useDistributions: (params?: any) => api.useList({ ...params, type: 'distribution' }),
  };
}
