import { useAutoApi } from '@/hooks/useAutoApi';

export function useJitsi() {
  const api = useAutoApi().jitsiConferencing;

  return {
    useRooms:        (params?: any) => api.useList({ ...params, type: 'conference_room' }),
    useParticipants: (params?: any) => api.useList({ ...params, type: 'participant' }),
    useSessions:     (params?: any) => api.useList({ ...params, type: 'conference_session' }),
    useMediaLogs:    (params?: any) => api.useList({ ...params, type: 'media_log' }),
  };
}
