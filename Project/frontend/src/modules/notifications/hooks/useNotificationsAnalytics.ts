'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, type NotificationListParams } from '../services/notifications.api';

const KEYS = {
  all: ['notifications'] as const,
  list: (params?: NotificationListParams) => [...KEYS.all, 'list', params] as const,
  unreadCount: () => [...KEYS.all, 'unread-count'] as const,
  preferences: () => [...KEYS.all, 'preferences'] as const,
};

export function useNotificationsInbox(params?: NotificationListParams) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => notificationsApi.list(params),
    staleTime: 10_000,
    refetchInterval: 20_000,
  });
}

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: KEYS.unreadCount(),
    queryFn: () => notificationsApi.unreadCount(),
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: KEYS.preferences(),
    queryFn: () => notificationsApi.preferences(),
    staleTime: 60_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof notificationsApi.updatePreferences>[0]) => notificationsApi.updatePreferences(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
