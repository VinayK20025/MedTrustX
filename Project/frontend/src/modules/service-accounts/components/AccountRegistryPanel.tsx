'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Cpu, Lock, RotateCw, AlertTriangle, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { ServiceAccount } from '../types/service-accounts.types';

interface AccountRegistryPanelProps {
  accounts: ServiceAccount[];
  activeAccountId?: string;
  onSelectAccount: (id: string) => void;
  onSuspendAccount: (id: string) => void;
}

const statusColors: Record<string, string> = {
  Active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Pending Rotation': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Suspended: 'text-red-400 bg-red-500/10 border-red-500/30',
  Revoked: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
};

export const AccountRegistryPanel: React.FC<AccountRegistryPanelProps> = ({ accounts, activeAccountId, onSelectAccount, onSuspendAccount }) => {
  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="Service Account Registry"
        icon={<Cpu className="w-4 h-4" />}
        action={<span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">{accounts.length} Identities</span>}
      />
      <CardBody className="flex-1 overflow-y-auto p-0">
        <div className="divide-y divide-white/[0.04]">
          {accounts.map(account => (
            <div
              key={account.id}
              onClick={() => onSelectAccount(account.id)}
              className={cn(
                "p-4 cursor-pointer transition-colors hover:bg-white/[0.02] border-l-2",
                activeAccountId === account.id ? "bg-white/[0.04] border-l-indigo-500" : "border-l-transparent"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 mr-2">
                  <h4 className="text-sm font-medium text-white leading-snug">{account.name}</h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">{account.id}</p>
                </div>
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0", statusColors[account.status])}>
                  {account.status}
                </span>
              </div>

              <div className="mt-2 mb-3">
                <p className="text-xs text-gray-400 line-clamp-1">{account.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 mb-3">
                <div className="bg-black/20 rounded p-1.5 border border-white/5 flex flex-col justify-center">
                  <p className="text-[9px] text-gray-500 uppercase">Owner</p>
                  <p className="text-xs font-medium text-gray-300 mt-0.5 truncate">{account.owner}</p>
                </div>
                <div className="bg-black/20 rounded p-1.5 border border-white/5 flex flex-col justify-center">
                  <p className="text-[9px] text-gray-500 uppercase">Last Activity</p>
                  <p className="text-xs font-mono text-gray-400 mt-0.5 truncate">{new Date(account.lastUsed).toLocaleTimeString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
                <div className="flex items-center gap-2">
                  {account.status === 'Active' ? <Lock className="w-3 h-3 text-emerald-400" /> :
                   account.status === 'Pending Rotation' ? <RotateCw className="w-3 h-3 text-amber-400 animate-spin-slow" /> :
                   account.status === 'Suspended' ? <ShieldOff className="w-3 h-3 text-red-400" /> :
                   <AlertTriangle className="w-3 h-3 text-gray-500" />}
                </div>

                {(account.status === 'Active' || account.status === 'Pending Rotation') && (
                  <Button size="sm" variant="outline" className="h-6 px-2 text-[9px] text-red-400 border-red-500/30 hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); onSuspendAccount(account.id); }}>
                    <ShieldOff className="w-2.5 h-2.5 mr-1" /> Suspend
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
