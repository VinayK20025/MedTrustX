import { useAutoApi } from '@/hooks/useAutoApi';

export function useLegalCaseManagement() {
  const api = useAutoApi().legalCaseManagement;
  
  return {
    useCases: (params?: any) => api.useList({ ...params, type: 'case' }),
    useDocuments: (params?: any) => api.useList({ ...params, type: 'document' }),
    useTasks: (params?: any) => api.useList({ ...params, type: 'task' }),
    useComplianceRecords: (params?: any) => api.useList({ ...params, type: 'compliance' }),
  };
}
