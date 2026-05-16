/**
 * MedTrustX — User Security Hooks
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../services/user.api';
import { notify } from '@/store/notification.store';
import type { ChangePasswordPayload } from '../types/user.types';

const KEYS = {
  sessions: ['user', 'sessions'] as const,
  deviceHistory: ['user', 'device-history'] as const,
};

/** Fetch active sessions */
export function useActiveSessions() {
  return useQuery({
    queryKey: KEYS.sessions,
    queryFn: () => userApi.getSessions(),
  });
}

/** Fetch device history */
export function useDeviceHistory() {
  return useQuery({
    queryKey: KEYS.deviceHistory,
    queryFn: () => userApi.getDeviceHistory(),
  });
}

/** Change password mutation */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordPayload) => userApi.changePassword(data),
    onSuccess: () => {
      notify.success('Password Changed', 'Your password has been updated successfully.');
    },
    onError: () => {
      notify.error('Password Change Failed', 'Incorrect current password or validation error.');
    },
  });
}

/** Enable MFA mutation */
export function useEnableMfa() {
  return useMutation({
    mutationFn: () => userApi.enableMfa(),
    onSuccess: () => {
      notify.success('MFA Enabled', 'Multi-factor authentication has been activated.');
    },
    onError: () => {
      notify.error('MFA Setup Failed', 'Could not enable MFA. Please try again.');
    },
  });
}

/** Disable MFA mutation */
export function useDisableMfa() {
  return useMutation({
    mutationFn: (code: string) => userApi.disableMfa(code),
    onSuccess: () => {
      notify.warning('MFA Disabled', 'Multi-factor authentication has been turned off.');
    },
    onError: () => {
      notify.error('MFA Disable Failed', 'Invalid verification code.');
    },
  });
}

/** Revoke single session */
export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => userApi.revokeSession(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.sessions });
      notify.success('Session Revoked', 'The session has been terminated.');
    },
    onError: () => notify.error('Revoke Failed', 'Could not revoke the session.'),
  });
}

/** Revoke all other sessions */
export function useRevokeAllSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => userApi.revokeAllSessions(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.sessions });
      notify.success('All Sessions Revoked', 'All other sessions have been terminated.');
    },
    onError: () => notify.error('Revoke Failed', 'Could not revoke sessions.'),
  });
}
