'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { IAMAuditLog } from '../types/iam.types';
import { ScrollText, ShieldAlert, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { auditLogs: IAMAuditLog[]; }

const severityCfg: Record<string, { icon: typeof Info; color: string; bg: string }> = {
  info:     { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/15' },
  warning:  { icon: AlertTriangle, color: 'text-warning-light', bg: 'bg-warning/15' },
  critical: { icon: ShieldAlert, color: 'text-emergency-light', bg: 'bg-emergency/15' },
};

export function IamAuditPanel({ auditLogs }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-500/15"><ScrollText className="w-4 h-4 text-orange-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Audit & Activity Logs</h3>
        </div>
      </CardHeader>

      <CardBody className="p-3 flex-1 overflow-y-auto max-h-[400px] space-y-2">
        {auditLogs.map(log => {
          const sCfg = severityCfg[log.severity] || severityCfg.info;
          const SevIcon = sCfg.icon;
          return (
            <div key={log.id} className={cn(
              'p-3 rounded-xl border flex items-start gap-3 transition-colors',
              log.severity === 'critical' ? 'border-emergency/30 bg-emergency/5' : 'border-white/[0.04] bg-surface-dark hover:bg-white/[0.02]'
            )}>
              <div className={cn('p-1.5 rounded-full mt-0.5', sCfg.bg)}>
                <SevIcon className={cn('w-3.5 h-3.5', sCfg.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-white leading-tight">{log.action}</p>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-gray-400 font-mono">{log.actor}</span>
                  <ArrowRight className="w-2.5 h-2.5 text-gray-600" />
                  <span className="text-[10px] text-gray-300 font-bold">{log.target}</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04] text-[9px] text-gray-500">
                  <span className="font-mono">{log.ipAddress}</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
