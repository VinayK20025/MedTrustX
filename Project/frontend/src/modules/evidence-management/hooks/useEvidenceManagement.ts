import { useAutoApi } from '@/hooks/useAutoApi';

export function useEvidenceManagement() {
  const api = useAutoApi().evidenceManagement;
  
  return {
    useItems: (params?: any) => api.useList({ ...params, type: 'item' }),
    useCustodyLogs: (params?: any) => api.useList({ ...params, type: 'custody' }),
    useMetadata: (params?: any) => api.useList({ ...params, type: 'metadata' }),
    useAccessRecords: (params?: any) => api.useList({ ...params, type: 'access' }),
  };
}
