'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { PasswordForm } from '../components/PasswordForm';
import { SessionList, DeviceHistoryList } from '../components/SessionList';
import { SettingsSection, SettingsRow } from '../components/SettingsSection';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { useUserProfile } from '../hooks/useUserProfile';
import {
  useChangePassword,
  useEnableMfa,
  useDisableMfa,
  useActiveSessions,
  useDeviceHistory,
  useRevokeSession,
  useRevokeAllSessions,
} from '../hooks/useUserSecurity';
import { Shield, Key, Smartphone, AlertTriangle } from 'lucide-react';
import { formatDateTime, timeAgo } from '@/utils/date';

export function SecurityPage() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data: profileData, isLoading: profileLoading } = useUserProfile();
  const { data: sessionsData, isLoading: sessionsLoading } = useActiveSessions();
  const { data: historyData, isLoading: historyLoading } = useDeviceHistory();
  const changePassword = useChangePassword();
  const enableMfa = useEnableMfa();
  const disableMfa = useDisableMfa();
  const revokeSession = useRevokeSession();
  const revokeAllSessions = useRevokeAllSessions();

  const profile = profileData?.data;
  const sessions = sessionsData?.data ?? [];
  const history = historyData?.data ?? [];

  useEffect(() => {
    setPageMeta('Security', 'Manage your account security and authentication');
  }, [setPageMeta]);

  const isLoading = profileLoading || sessionsLoading || historyLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <Breadcrumbs items={[
        { label: 'Settings', href: '/dashboard/settings' },
        { label: 'Security' },
      ]} />

      {/* Zero Trust Status Card */}
      <SettingsSection title="Security Overview" icon={<Shield className="w-4 h-4" />}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <p className="text-2xs text-gray-600 uppercase tracking-wider">Last Login</p>
            <p className="text-sm text-gray-300 mt-1">{profile?.lastLoginAt ? timeAgo(profile.lastLoginAt) : '—'}</p>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <p className="text-2xs text-gray-600 uppercase tracking-wider">Last IP</p>
            <p className="text-sm text-gray-300 mt-1 font-mono">{profile?.lastLoginIp ?? '—'}</p>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <p className="text-2xs text-gray-600 uppercase tracking-wider">Password Changed</p>
            <p className="text-sm text-gray-300 mt-1">{profile?.passwordChangedAt ? timeAgo(profile.passwordChangedAt) : 'Never'}</p>
          </div>
        </div>
      </SettingsSection>

      {/* Password Change */}
      <PasswordForm
        onSubmit={(data) => changePassword.mutate(data)}
        saving={changePassword.isPending}
      />

      {/* MFA Toggle */}
      <SettingsSection
        title="Multi-Factor Authentication"
        description="Add an extra layer of security to your account"
        icon={<Smartphone className="w-4 h-4" />}
      >
        <div className="py-2">
          <ToggleSwitch
            label={profile?.mfaEnabled ? 'MFA is enabled' : 'MFA is disabled'}
            description={
              profile?.mfaEnabled
                ? 'Your account is protected with an authenticator app'
                : 'Enable MFA to protect your account with a second factor'
            }
            checked={profile?.mfaEnabled ?? false}
            onChange={(enabled) => {
              if (enabled) {
                enableMfa.mutate();
              } else {
                // In a real implementation, prompt for TOTP code first
                disableMfa.mutate('000000');
              }
            }}
          />
          {!profile?.mfaEnabled && (
            <div className="mt-3 p-3 rounded-lg bg-warning/5 border border-warning/20 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-warning-light flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-warning-light font-medium">Recommended: Enable MFA</p>
                <p className="text-xs text-gray-500 mt-0.5">Multi-factor authentication significantly reduces the risk of unauthorized access.</p>
              </div>
            </div>
          )}
        </div>
      </SettingsSection>

      {/* Active Sessions */}
      <SessionList
        sessions={sessions}
        onRevoke={(id) => revokeSession.mutate(id)}
        onRevokeAll={() => revokeAllSessions.mutate()}
        revoking={revokeSession.isPending || revokeAllSessions.isPending}
      />

      {/* Device History */}
      {history.length > 0 && (
        <DeviceHistoryList history={history} />
      )}
    </div>
  );
}
