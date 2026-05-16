/**
 * MedTrustX — User API Client
 * Maps to: user-service, iam-service, auth endpoints
 */
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/services/api';
import type { ApiResponse } from '@/types/api.types';
import type {
  UserProfile,
  UpdateProfilePayload,
  UserSettings,
  UserPreferences,
  NotificationPreferences,
  AppearanceSettings,
  AccessibilitySettings,
  ChangePasswordPayload,
  MfaSetupResponse,
  ActiveSession,
  DeviceHistoryEntry,
} from '../types/user.types';

const BASE_USER = '/api/v1/users';
const BASE_AUTH = '/api/v1/auth';

export const userApi = {
  /* ── Profile ─────────────────────────────────────────── */
  getProfile: () =>
    apiGet<ApiResponse<UserProfile>>(`${BASE_USER}/me`),

  updateProfile: (data: UpdateProfilePayload) =>
    apiPut<ApiResponse<UserProfile>>(`${BASE_USER}/me`, data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiPost<ApiResponse<{ url: string }>>(`${BASE_USER}/me/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteAvatar: () =>
    apiDelete<void>(`${BASE_USER}/me/avatar`),

  /* ── Settings ────────────────────────────────────────── */
  getSettings: () =>
    apiGet<ApiResponse<UserSettings>>(`${BASE_USER}/me/settings`),

  updatePreferences: (data: Partial<UserPreferences>) =>
    apiPatch<ApiResponse<UserPreferences>>(`${BASE_USER}/me/settings/preferences`, data),

  updateNotifications: (data: Partial<NotificationPreferences>) =>
    apiPatch<ApiResponse<NotificationPreferences>>(`${BASE_USER}/me/settings/notifications`, data),

  updateAppearance: (data: Partial<AppearanceSettings>) =>
    apiPatch<ApiResponse<AppearanceSettings>>(`${BASE_USER}/me/settings/appearance`, data),

  updateAccessibility: (data: Partial<AccessibilitySettings>) =>
    apiPatch<ApiResponse<AccessibilitySettings>>(`${BASE_USER}/me/settings/accessibility`, data),

  /* ── Security ────────────────────────────────────────── */
  changePassword: (data: ChangePasswordPayload) =>
    apiPost<ApiResponse<void>>(`${BASE_AUTH}/change-password`, data),

  enableMfa: () =>
    apiPost<ApiResponse<MfaSetupResponse>>(`${BASE_AUTH}/enable-mfa`),

  disableMfa: (code: string) =>
    apiPost<ApiResponse<void>>(`${BASE_AUTH}/disable-mfa`, { code }),

  verifyMfa: (code: string) =>
    apiPost<ApiResponse<{ verified: boolean }>>(`${BASE_AUTH}/verify-mfa`, { code }),

  getSessions: () =>
    apiGet<ApiResponse<ActiveSession[]>>(`${BASE_AUTH}/sessions`),

  revokeSession: (sessionId: string) =>
    apiDelete<void>(`${BASE_AUTH}/sessions/${sessionId}`),

  revokeAllSessions: () =>
    apiPost<void>(`${BASE_AUTH}/sessions/revoke-all`),

  getDeviceHistory: () =>
    apiGet<ApiResponse<DeviceHistoryEntry[]>>(`${BASE_AUTH}/device-history`),
};
