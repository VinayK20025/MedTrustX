import { useAutoApi } from '@/hooks/useAutoApi';

export function useIot() {
  const api = useAutoApi().iotMessaging;

  return {
    useConnections: (params?: any) => api.useList({ ...params, type: 'device_connection' }),
    useTopics:      (params?: any) => api.useList({ ...params, type: 'mqtt_topic' }),
    useMessages:    (params?: any) => api.useList({ ...params, type: 'message_log' }),
    useCommands:    (params?: any) => api.useList({ ...params, type: 'device_command' }),
    useEvents:      (params?: any) => api.useList({ ...params, type: 'device_event' }),
  };
}
