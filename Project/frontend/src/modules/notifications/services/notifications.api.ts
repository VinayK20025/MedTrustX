import { apiGet, apiPatch } from '@/services/api';
import { endpoints } from '@/services/endpoints';
import type { ApiResponse } from '@/types/api.types';
import type { NotificationPreferences } from '@/modules/user/types/user.types';

export interface NotificationListParams {
  scope?: 'sre' | 'it_ops' | 'all';
  severity?: string;
  status?: string;
  unread?: boolean;
  q?: string;
  limit?: number;
}

export const notificationsApi = {
  list: (params?: NotificationListParams) => apiGet<ApiResponse<any>>(endpoints.notifications.list, { params }),
  unreadCount: () => apiGet<ApiResponse<any>>(endpoints.notifications.unreadCount),
  preferences: () => apiGet<ApiResponse<NotificationPreferences>>(endpoints.notifications.preferences),
  updatePreferences: (data: Partial<NotificationPreferences>) =>
    apiPatch<ApiResponse<NotificationPreferences>>(endpoints.notifications.preferences, data),
  markRead: (id: string) =>
    apiPatch<ApiResponse<any>>(endpoints.notifications.markRead(id), { read: true }),
};
