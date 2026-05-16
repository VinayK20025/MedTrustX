'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { IAMIdentity } from '../types/iam.types';
import { useLockUser, useEnforceMfa } from '../hooks/useIamAnalytics';
import { Users, ShieldCheck, ShieldOff, Lock, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { identities: IAMIdentity[]; }

const statusCfg: Record<string, { color: string; bg: string }> = {
  active:   { color: 'text-success-light', bg: 'bg-success/15' },
  inactive: { color: 'text-gray-500', bg: 'bg-white/5' },
  locked:   { color: 'text-emergency-light', bg: 'bg-emergency/15' },
  pending:  { color: 'text-warning-light', bg: 'bg-warning/15' },
};

export function IamUserPanel({ identities }: Props) {
  const { mutate: lockUser } = useLockUser();
  const { mutate: enforceMfa } = useEnforceMfa();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/15"><Users className="w-4 h-4 text-indigo-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Identity Management</h3>
        </div>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 border-none text-white font-bold text-xs">
          Provision User
        </Button>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.04] bg-surface-dark/50 sticky top-0">
              <th className="py-3 pl-5 text-[10px] font-bold text-gray-500 uppercase">User</th>
              <th className="py-3 text-[10px] font-bold text-gray-500 uppercase">Role / Dept</th>
              <th className="py-3 text-[10px] font-bold text-gray-500 uppercase text-center">Status</th>
              <th className="py-3 text-[10px] font-bold text-gray-500 uppercase text-center">MFA</th>
              <th className="py-3 pr-5 text-[10px] font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {identities.map(user => {
              const cfg = statusCfg[user.status] || statusCfg.inactive;
              return (
                <tr key={user.id} className="border-b border-white/[0.02] hover:bg-white/[0.015]">
                  <td className="py-3 pl-5">
                    <span className="text-[13px] font-bold text-white block">{user.name}</span>
                    <span className="text-[10px] text-gray-500">{user.email}</span>
                  </td>
                  <td className="py-3">
                    <span className="text-[11px] font-bold text-gray-300 block">{user.role}</span>
                    <span className="text-[10px] text-gray-500">{user.department}</span>
                  </td>
                  <td className="py-3 text-center">
                    <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded', cfg.bg, cfg.color)}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <div className="flex justify-center">
                      {user.mfaStatus === 'enabled' ? (
                        <ShieldCheck className="w-4 h-4 text-success-light" />
                      ) : (
                        <ShieldOff className="w-4 h-4 text-emergency-light" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-5 text-right">
                    <div className="flex justify-end gap-2">
                      {user.mfaStatus === 'disabled' && (
                        <Button size="xs" variant="outline" onClick={() => enforceMfa(user.id)} className="h-6 text-[9px] border-warning/30 text-warning-light">
                          Enforce MFA
                        </Button>
                      )}
                      {user.status !== 'locked' && (
                        <Button size="xs" variant="ghost" onClick={() => lockUser(user.id)} className="h-6 text-[9px] text-gray-400 hover:text-emergency-light">
                          <Lock className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
