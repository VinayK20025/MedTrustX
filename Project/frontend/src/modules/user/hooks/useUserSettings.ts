/**
 * MedTrustX — User Settings Hooks
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../services/user.api';
import { notify } from '@/store/notification.store';
import type {
  UserPreferences,
  NotificationPreferences,
  AppearanceSettings,
  AccessibilitySettings,
} from '../types/user.types';

const KEYS = {
  settings: ['user', 'settings'] as const,
};

/** Fetch all user settings */
export function useUserSettings() {
  return useQuery({
    queryKey: KEYS.settings,
    queryFn: () => userApi.getSettings(),
    staleTime: 60_000,
  });
}

/** Update preferences */
export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<UserPreferences>) => userApi.updatePreferences(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.settings });
      notify.success('Preferences Saved');
    },
    onError: () => notify.error('Save Failed', 'Could not save preferences.'),
  });
}

/** Update notification settings */
export function useUpdateNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<NotificationPreferences>) => userApi.updateNotifications(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.settings });
      notify.success('Notification Settings Saved');
    },
    onError: () => notify.error('Save Failed', 'Could not save notification settings.'),
  });
}

/** Update appearance settings */
export function useUpdateAppearance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AppearanceSettings>) => userApi.updateAppearance(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.settings });
      notify.success('Appearance Updated');
    },
    onError: () => notify.error('Save Failed', 'Could not save appearance settings.'),
  });
}

/** Update accessibility settings */
export function useUpdateAccessibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AccessibilitySettings>) => userApi.updateAccessibility(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.settings });
      notify.success('Accessibility Settings Saved');
    },
    onError: () => notify.error('Save Failed', 'Could not save accessibility settings.'),
  });
}
