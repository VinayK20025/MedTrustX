'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { GlobalAuditLog } from '../types/superAdmin.types';
import { ScrollText, Info, AlertTriangle, ShieldAlert, Filter, CheckCircle2, XCircle, Shield } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { auditLogs: GlobalAuditLog[]; }

const severityCfg: Record<string, { icon: typeof Info; color: string; bg: string }> = {
  info:     { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/15' },
  warning:  { icon: AlertTriangle, color: 'text-warning-light', bg: 'bg-warning/15' },
  critical: { icon: ShieldAlert, color: 'text-emergency-light', bg: 'bg-emergency/15' },
};

const outcomeCfg: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  success: { icon: CheckCircle2, color: 'text-success-light' },
  failure: { icon: XCircle, color: 'text-emergency-light' },
  blocked: { icon: Shield, color: 'text-warning-light' },
};

const categoryColors: Record<string, string> = {
  auth: 'bg-indigo-500/15 text-indigo-300', policy: 'bg-teal-500/15 text-teal-400',
  override: 'bg-emergency/15 text-emergency-light', tenant: 'bg-cyan-500/15 text-cyan-300',
  user: 'bg-purple-500/15 text-purple-300', system: 'bg-white/5 text-gray-400',
  data: 'bg-amber-500/15 text-amber-300',
};

export function SuperAdminAuditPanel({ auditLogs }: Props) {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const filtered = severityFilter === 'all' ? auditLogs : auditLogs.filter(l => l.severity === severityFilter);

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/15"><ScrollText className="w-4 h-4 text-amber-400" /></div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">Global Audit Trail</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Immutable record · {auditLogs.length} entries
              {auditLogs.filter(l => l.severity === 'critical').length > 0 && (
                <span className="text-emergency-light font-bold ml-1">
                  · {auditLogs.filter(l => l.severity === 'critical').length} critical
                </span>
              )}
            </p>
          </div>
        </div>
        <Button size="sm" variant="ghost" leftIcon={<Filter className="w-3 h-3" />} className="text-[11px] text-gray-400">
          Export
        </Button>
      </CardHeader>

      {/* Severity Filter */}
      <div className="px-4 py-2 border-b border-white/[0.03] flex items-center gap-2">
        {['all', 'critical', 'warning', 'info'].map(sev => (
          <button key={sev} onClick={() => setSeverityFilter(sev)}
            className={cn('text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md transition-all',
              severityFilter === sev ? 'bg-teal-500/20 text-teal-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
            )}>
            {sev}
          </button>
        ))}
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[500px]">
        <div className="divide-y divide-white/[0.03]">
          {filtered.map(log => {
            const sCfg = severityCfg[log.severity] || severityCfg.info;
            const oCfg = outcomeCfg[log.outcome] || outcomeCfg.success;
            const SevIcon = sCfg.icon;
            const OutIcon = oCfg.icon;
            return (
              <div key={log.id} className={cn(
                'px-5 py-4 hover:bg-white/[0.015] transition-colors',
                log.severity === 'critical' && 'bg-emergency/[0.02]'
              )}>
                <div className="flex items-start gap-3">
                  <div className={cn('p-1.5 rounded-full mt-0.5 flex-shrink-0', sCfg.bg)}>
                    <SevIcon className={cn('w-3.5 h-3.5', sCfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-bold text-white leading-tight">{log.action}</p>
                      <OutIcon className={cn('w-3.5 h-3.5 flex-shrink-0 mt-0.5', oCfg.color)} />
                    </div>
                    {log.details && <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{log.details}</p>}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={cn('text-[8px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wider', categoryColors[log.category] || 'bg-white/5 text-gray-400')}>
                        {log.category}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        <strong className="text-gray-300 font-mono">{log.actor}</strong>
                        <span className="text-gray-700 mx-1">·</span>
                        {log.tenant}
                        <span className="text-gray-700 mx-1">·</span>
                        <span className="font-mono text-gray-600">{log.ipAddress}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[9px] text-gray-600">
                      <span className="font-mono">{log.correlationId}</span>
                      <span>·</span>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
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
