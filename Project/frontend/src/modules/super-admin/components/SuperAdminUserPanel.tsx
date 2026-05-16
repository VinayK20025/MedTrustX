'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { GlobalUser } from '../types/superAdmin.types';
import { useLockUser, useEnforceMfa } from '../hooks/useSuperAdminAnalytics';
import { Users, Search, ShieldCheck, ShieldOff, Lock, KeyRound, AlertTriangle, Clock, Fingerprint } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { users: GlobalUser[]; }

const statusCfg: Record<string, { color: string; bg: string; label: string }> = {
  active:      { color: 'text-success-light', bg: 'bg-success/15', label: 'Active' },
  inactive:    { color: 'text-gray-500', bg: 'bg-white/5', label: 'Inactive' },
  locked:      { color: 'text-emergency-light', bg: 'bg-emergency/15', label: 'Locked' },
  pending_mfa: { color: 'text-warning-light', bg: 'bg-warning/15', label: 'Pending MFA' },
};

function RiskBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-emergency-light bg-emergency/15 border-emergency/30' :
                score >= 50 ? 'text-warning-light bg-warning/15 border-warning/30' :
                score >= 20 ? 'text-blue-300 bg-blue-500/15 border-blue-500/30' :
                'text-success-light bg-success/15 border-success/30';
  return (
    <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border', color)}>
      Risk: {score}
    </span>
  );
}

export function SuperAdminUserPanel({ users }: Props) {
  const [search, setSearch] = useState('');
  const { mutate: lockUser, isPending: locking } = useLockUser();
  const { mutate: enforceMfa, isPending: enforcing } = useEnforceMfa();

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.tenantName.toLowerCase().includes(search.toLowerCase())
  );

  const highRisk = users.filter(u => u.riskScore >= 50).length;
  const noMfa = users.filter(u => !u.mfaEnabled).length;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/15"><Users className="w-4 h-4 text-cyan-400" /></div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">Cross-Tenant Users</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[11px] text-gray-500">{users.length} users</p>
              {highRisk > 0 && <span className="text-[9px] font-bold text-emergency-light bg-emergency/15 px-1.5 py-0.5 rounded">{highRisk} High Risk</span>}
              {noMfa > 0 && <span className="text-[9px] font-bold text-warning-light bg-warning/15 px-1.5 py-0.5 rounded">{noMfa} No MFA</span>}
            </div>
          </div>
        </div>
      </CardHeader>

      <div className="px-4 py-3 border-b border-white/[0.03]">
        <Input placeholder="Search users, emails, or tenants..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="h-9 text-sm bg-surface-dark border-white/[0.06]" leftIcon={<Search className="w-3.5 h-3.5 text-gray-500" />} />
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[500px]">
        <div className="divide-y divide-white/[0.03]">
          {filtered.map(user => {
            const cfg = statusCfg[user.status] || statusCfg.active;
            return (
              <div key={user.id} className="px-5 py-4 hover:bg-white/[0.015] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                      user.riskScore >= 50 ? 'bg-emergency/20 text-emergency-light' : 'bg-surface-dark text-gray-300 border border-white/10'
                    )}>
                      {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">{user.name}</span>
                        <span className={cn('text-[9px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wider', cfg.bg, cfg.color)}>{cfg.label}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[9px] font-bold text-indigo-300 bg-indigo-500/15 px-1.5 py-0.5 rounded">{user.role}</span>
                        <span className="text-[9px] text-gray-500 bg-white/[0.03] px-1.5 py-0.5 rounded">{user.tenantName}</span>
                        <RiskBadge score={user.riskScore} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      {user.mfaEnabled ?
                        <Fingerprint className="w-3.5 h-3.5 text-success-light" /> :
                        <ShieldOff className="w-3.5 h-3.5 text-warning-light" />
                      }
                      <span className={cn('text-[9px] font-bold', user.mfaEnabled ? 'text-success-light' : 'text-warning-light')}>
                        {user.mfaEnabled ? 'MFA' : 'No MFA'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-gray-600">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.03]">
                  <div className="text-[10px] text-gray-600 flex items-center gap-3">
                    <span>Sessions: <strong className="text-gray-400">{user.sessions}</strong></span>
                    {user.loginAttempts > 0 && (
                      <span className="text-warning-light flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" />{user.loginAttempts} failed attempts
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!user.mfaEnabled && (
                      <Button size="xs" variant="outline" onClick={() => enforceMfa(user.id)} disabled={enforcing}
                        leftIcon={<KeyRound className="w-2.5 h-2.5" />} className="h-6 text-[9px] border-warning/30 text-warning-light hover:bg-warning/10">
                        Enforce MFA
                      </Button>
                    )}
                    {user.status !== 'locked' && (
                      <Button size="xs" variant="ghost" onClick={() => lockUser({ userId: user.id, reason: 'Manual lock' })} disabled={locking}
                        leftIcon={<Lock className="w-2.5 h-2.5" />} className="h-6 text-[9px] text-gray-500 hover:text-emergency-light hover:bg-emergency/10">
                        Lock
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
