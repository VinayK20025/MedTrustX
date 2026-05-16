import { useAutoApi } from '@/hooks/useAutoApi';

export function useSimulation() {
  const api = useAutoApi().simulationWhatifEngine;
  
  return {
    useSimulations: (params?: any) => api.useList({ ...params, type: 'simulation' }),
    useScenarios: (params?: any) => api.useList({ ...params, type: 'scenario' }),
    useResults: (params?: any) => api.useList({ ...params, type: 'result' }),
    useEvents: (params?: any) => api.useList({ ...params, type: 'event' }),
  };
}
