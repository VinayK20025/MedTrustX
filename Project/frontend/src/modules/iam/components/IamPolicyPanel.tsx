'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { IAMPolicy } from '../types/iam.types';
import { FileCode2, CheckCircle2, Eye, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { policies: IAMPolicy[]; }

const statusCfg: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  enforced:   { icon: CheckCircle2, color: 'text-success-light', bg: 'bg-success/15' },
  audit_only: { icon: Eye, color: 'text-warning-light', bg: 'bg-warning/15' },
  disabled:   { icon: XCircle, color: 'text-gray-500', bg: 'bg-white/5' },
};

const severityColors: Record<string, string> = {
  critical: 'text-emergency-light', high: 'text-warning-light', medium: 'text-blue-300', low: 'text-gray-400'
};

export function IamPolicyPanel({ policies }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/15"><FileCode2 className="w-4 h-4 text-teal-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Access Policies</h3>
        </div>
        <Button size="sm" className="bg-teal-600 hover:bg-teal-500 border-none text-white font-bold text-xs">
          New Policy
        </Button>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.04] bg-surface-dark/50 sticky top-0">
              <th className="py-3 pl-5 text-[10px] font-bold text-gray-500 uppercase">Policy Name</th>
              <th className="py-3 text-[10px] font-bold text-gray-500 uppercase">Condition</th>
              <th className="py-3 text-[10px] font-bold text-gray-500 uppercase text-center">Severity</th>
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
                    <span className="text-[9px] font-mono text-gray-500">{p.id}</span>
                  </td>
                  <td className="py-3">
                    <code className="text-[10px] font-mono text-teal-300 bg-teal-500/10 px-2 py-1 rounded">{p.condition}</code>
                  </td>
                  <td className="py-3 text-center">
                    <span className={cn('text-[10px] uppercase font-bold tracking-wider', severityColors[p.severity])}>
                      {p.severity}
                    </span>
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
