import { useAutoApi } from '@/hooks/useAutoApi';

export function useZeroTrustNetwork() {
  const api = useAutoApi().zeroTrustNetworkControl;
  
  return {
    usePolicies: (params?: any) => api.useList({ ...params, type: 'policy' }),
    useSessions: (params?: any) => api.useList({ ...params, type: 'session' }),
    useDevicePosture: (params?: any) => api.useList({ ...params, type: 'posture' }),
    useDecisions: (params?: any) => api.useList({ ...params, type: 'decision' }),
  };
}
