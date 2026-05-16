import { useAutoApi } from '@/hooks/useAutoApi';

export function useAutomationRpa() {
  const api = useAutoApi().automationRpaEngine;
  
  return {
    useWorkflows: (params?: any) => api.useList({ ...params, type: 'workflow' }),
    useRuns: (params?: any) => api.useList({ ...params, type: 'run' }),
    useTasks: (params?: any) => api.useList({ ...params, type: 'task' }),
    useBots: (params?: any) => api.useList({ ...params, type: 'bot' }),
  };
}
