'use client';
import React, { useState } from 'react';
import { SettingsSection } from './SettingsSection';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { Monitor, Smartphone, Globe, Clock, MapPin, Trash2, LogOut } from 'lucide-react';
import { timeAgo, formatDateTime } from '@/utils/date';
import type { ActiveSession, DeviceHistoryEntry } from '../types/user.types';

/* ══════════════════════════════════════════════════════════
   Active Sessions
   ══════════════════════════════════════════════════════════ */

interface SessionListProps {
  sessions: ActiveSession[];
  onRevoke: (sessionId: string) => void;
  onRevokeAll: () => void;
  revoking?: boolean;
}

export function SessionList({ sessions, onRevoke, onRevokeAll, revoking }: SessionListProps) {
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const [confirmRevokeAll, setConfirmRevokeAll] = useState(false);

  return (
    <SettingsSection
      title="Active Sessions"
      description="Devices currently signed in to your account"
      icon={<Monitor className="w-4 h-4" />}
      action={
        sessions.length > 1 ? (
          <Button variant="ghost" size="xs" onClick={() => setConfirmRevokeAll(true)} className="text-emergency-light hover:text-emergency">
            <LogOut className="w-3 h-3 mr-1" /> Sign out all others
          </Button>
        ) : null
      }
    >
      <div className="divide-y divide-white/[0.04]">
        {sessions.map((session) => (
          <div key={session.id} className="flex items-center gap-4 py-3.5">
            <div className="p-2.5 rounded-lg bg-white/[0.04] text-gray-400 flex-shrink-0">
              {session.device.toLowerCase().includes('mobile') ? (
                <Smartphone className="w-5 h-5" />
              ) : (
                <Monitor className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-200">{session.browser} on {session.os}</p>
                {session.isCurrent && <Badge variant="success" size="sm">Current</Badge>}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{session.ipAddress}</span>
                {session.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{session.location}</span>}
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(session.lastActivity)}</span>
              </div>
            </div>
            {!session.isCurrent && (
              <Button variant="ghost" size="xs" onClick={() => setConfirmRevoke(session.id)} className="text-gray-500 hover:text-emergency-light">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Confirm revoke single */}
      <ConfirmDialog
        open={!!confirmRevoke}
        onClose={() => setConfirmRevoke(null)}
        onConfirm={() => { if (confirmRevoke) onRevoke(confirmRevoke); setConfirmRevoke(null); }}
        title="Revoke Session"
        message="This will sign out the device immediately. The user will need to log in again."
        variant="warning"
        confirmLabel="Revoke"
        loading={revoking}
      />

      {/* Confirm revoke all */}
      <ConfirmDialog
        open={confirmRevokeAll}
        onClose={() => setConfirmRevokeAll(false)}
        onConfirm={() => { onRevokeAll(); setConfirmRevokeAll(false); }}
        title="Sign Out All Other Sessions"
        message="This will terminate all sessions except your current one. All other devices will be signed out."
        variant="danger"
        confirmLabel="Sign Out All"
        loading={revoking}
      />
    </SettingsSection>
  );
}

/* ══════════════════════════════════════════════════════════
   Device History
   ══════════════════════════════════════════════════════════ */

interface DeviceHistoryListProps {
  history: DeviceHistoryEntry[];
}

const actionLabels: Record<string, string> = {
  login: 'Signed in',
  logout: 'Signed out',
  failed_login: 'Failed login',
  password_change: 'Password changed',
  mfa_setup: 'MFA configured',
};

const actionVariants: Record<string, 'success' | 'danger' | 'warning' | 'info' | 'default'> = {
  login: 'success',
  logout: 'default',
  failed_login: 'danger',
  password_change: 'info',
  mfa_setup: 'info',
};

export function DeviceHistoryList({ history }: DeviceHistoryListProps) {
  return (
    <SettingsSection
      title="Device & Login History"
      description="Recent authentication activity on your account"
      icon={<Clock className="w-4 h-4" />}
    >
      <div className="divide-y divide-white/[0.04] max-h-[400px] overflow-y-auto">
        {history.map((entry) => (
          <div key={entry.id} className="flex items-center gap-4 py-3">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${entry.success ? 'bg-success' : 'bg-emergency'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-300">{actionLabels[entry.action] ?? entry.action}</p>
                <Badge variant={actionVariants[entry.action] ?? 'default'} size="sm">
                  {entry.success ? 'Success' : 'Failed'}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-600">
                <span>{entry.browser} • {entry.os}</span>
                <span>{entry.ipAddress}</span>
                {entry.location && <span>{entry.location}</span>}
              </div>
            </div>
            <span className="text-xs text-gray-600 flex-shrink-0">{formatDateTime(entry.timestamp)}</span>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
}
