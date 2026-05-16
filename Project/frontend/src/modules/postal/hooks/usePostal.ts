import { useAutoApi } from '@/hooks/useAutoApi';

export function usePostal() {
  const api = useAutoApi().postalMail;

  return {
    useMessages: (params?: any) => api.useList({ ...params, type: 'email_message' }),
    useLogs:     (params?: any) => api.useList({ ...params, type: 'email_log' }),
    useQueues:   (params?: any) => api.useList({ ...params, type: 'email_queue' }),
    useBounces:  (params?: any) => api.useList({ ...params, type: 'email_bounce' }),
  };
}
