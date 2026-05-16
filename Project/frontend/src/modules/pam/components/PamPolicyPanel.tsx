'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { PAMPolicy } from '../types/pam.types';
import { FileCode2, CheckCircle2, Eye, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { policies: PAMPolicy[]; }

const statusCfg: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  enabled:    { icon: CheckCircle2, color: 'text-success-light', bg: 'bg-success/15' },
  audit_only: { icon: Eye, color: 'text-warning-light', bg: 'bg-warning/15' },
  disabled:   { icon: XCircle, color: 'text-gray-500', bg: 'bg-white/5' },
};

export function PamPolicyPanel({ policies }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/15"><FileCode2 className="w-4 h-4 text-teal-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">PAM Policies</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.04] bg-surface-dark/50 sticky top-0">
              <th className="py-3 pl-5 text-[10px] font-bold text-gray-500 uppercase">Policy Rule</th>
              <th className="py-3 text-[10px] font-bold text-gray-500 uppercase">Type</th>
              <th className="py-3 pr-5 text-[10px] font-bold text-gray-500 uppercase text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {policies.map(p => {
              const sCfg = statusCfg[p.status] || statusCfg.disabled;
              const SIcon = sCfg.icon;
              return (
                <tr key={p.id} className="border-b border-white/[0.02] hover:bg-white/[0.015]">
                  <td className="py-3 pl-5">
                    <span className="text-[13px] font-bold text-white block">{p.name}</span>
                    <span className="text-[10px] text-gray-500">{p.description}</span>
                  </td>
                  <td className="py-3">
                    <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded">{p.type}</span>
                  </td>
                  <td className="py-3 pr-5 text-right">
                    <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded inline-flex items-center gap-1', sCfg.bg, sCfg.color)}>
                      <SIcon className="w-3 h-3" /> {p.status.replace('_', ' ')}
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
