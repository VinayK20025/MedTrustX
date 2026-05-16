'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PAMAccount } from '../types/pam.types';
import { KeyRound, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { accounts: PAMAccount[]; }

const statusCfg: Record<string, { color: string; bg: string }> = {
  active:   { color: 'text-success-light', bg: 'bg-success/15' },
  vaulted:  { color: 'text-indigo-400', bg: 'bg-indigo-500/15' },
  locked:   { color: 'text-emergency-light', bg: 'bg-emergency/15' },
};

export function PamAccessPanel({ accounts }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/15"><KeyRound className="w-4 h-4 text-indigo-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Privileged Accounts</h3>
        </div>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 border-none text-white font-bold text-xs">
          Vault Account
        </Button>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.04] bg-surface-dark/50 sticky top-0">
              <th className="py-3 pl-5 text-[10px] font-bold text-gray-500 uppercase">Account / System</th>
              <th className="py-3 text-[10px] font-bold text-gray-500 uppercase">Access Level</th>
              <th className="py-3 text-[10px] font-bold text-gray-500 uppercase text-center">Status</th>
              <th className="py-3 pr-5 text-[10px] font-bold text-gray-500 uppercase text-right">Risk Score</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(acc => {
              const cfg = statusCfg[acc.status] || statusCfg.locked;
              return (
                <tr key={acc.id} className="border-b border-white/[0.02] hover:bg-white/[0.015]">
                  <td className="py-3 pl-5">
                    <span className="text-[13px] font-bold text-white block">{acc.accountName}</span>
                    <span className="text-[10px] text-gray-500">{acc.system}</span>
                  </td>
                  <td className="py-3">
                    <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{acc.accessLevel}</span>
                  </td>
                  <td className="py-3 text-center">
                    <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded', cfg.bg, cfg.color)}>
                      {acc.status}
                    </span>
                  </td>
                  <td className="py-3 pr-5 text-right">
                    <span className={cn('text-[11px] font-black', 
                      acc.riskScore >= 80 ? 'text-emergency-light' : acc.riskScore >= 50 ? 'text-warning-light' : 'text-success-light'
                    )}>
                      {acc.riskScore}
                    </span>
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
