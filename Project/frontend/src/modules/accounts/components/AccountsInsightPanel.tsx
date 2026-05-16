'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ReconciliationEntry, AuditLogEntry } from '../types/accounts.types';
import { useResolveDiscrepancy } from '../hooks/useAccountsAnalytics';
import { Scale, CheckCircle2, AlertTriangle, XCircle, Shield, Wrench } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { reconciliation: ReconciliationEntry[]; auditLogs: AuditLogEntry[]; }

const matchStyle: Record<ReconciliationEntry['matchStatus'], { bg: string; text: string; icon: React.ReactNode }> = {
  Matched: { bg: 'bg-success/10', text: 'text-success-light', icon: <CheckCircle2 className="w-3.5 h-3.5 text-success-light" /> },
  Discrepancy: { bg: 'bg-warning/10', text: 'text-warning-light', icon: <AlertTriangle className="w-3.5 h-3.5 text-warning-light" /> },
  Unmatched: { bg: 'bg-emergency/10', text: 'text-emergency-light', icon: <XCircle className="w-3.5 h-3.5 text-emergency-light" /> },
};

const auditSevColor: Record<AuditLogEntry['severity'], string> = {
  Info: 'text-gray-400', Warning: 'text-warning-light', Critical: 'text-emergency-light',
};

export function AccountsInsightPanel({ reconciliation, auditLogs }: Props) {
  const { mutate: resolve, isPending } = useResolveDiscrepancy();
  const issues = reconciliation.filter(r => r.matchStatus !== 'Matched');

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Reconciliation */}
      <Card className={cn("shadow-glass flex-1 flex flex-col", issues.length > 0 ? "border-warning/25" : "border-white/[0.06]")}>
        <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-[12px] font-bold tracking-widest text-amber-400">RECONCILIATION</h3>
          </div>
          {issues.length > 0 && <span className="text-[9px] bg-warning/20 text-warning-light px-2 py-0.5 rounded font-bold">{issues.length} issues</span>}
        </CardHeader>
        <CardBody className="p-0 flex-1 overflow-y-auto">
          <div className="divide-y divide-white/[0.03]">
            {reconciliation.map(r => {
              const m = matchStyle[r.matchStatus];
              return (
                <div key={r.id} className={cn("p-3", r.matchStatus === 'Discrepancy' && "bg-warning/[0.03]")}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-mono text-white font-bold">{r.transactionRef}</span>
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1", m.bg, m.text)}>{m.icon} {r.matchStatus}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                    <span>System: ₹{r.systemAmount.toLocaleString()}</span>
                    <span>Bank: ₹{r.bankAmount.toLocaleString()}</span>
                    {r.matchStatus !== 'Matched' && (
                      <Button size="sm" disabled={isPending} onClick={() => resolve(r.id)} className="h-6 text-[9px] bg-white/5 hover:bg-white/10 text-gray-300" leftIcon={<Wrench className="w-2.5 h-2.5" />}>Fix</Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Audit Trail */}
      <Card className="border-white/[0.06] shadow-glass flex-1 flex flex-col">
        <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <h3 className="text-[12px] font-bold tracking-widest text-blue-400">AUDIT TRAIL</h3>
        </CardHeader>
        <CardBody className="p-0 flex-1 overflow-y-auto">
          <div className="divide-y divide-white/[0.03]">
            {auditLogs.map(a => (
              <div key={a.id} className={cn("p-3", a.severity === 'Critical' && "bg-emergency/[0.03]")}>
                <p className={cn("text-[11px] font-bold", auditSevColor[a.severity])}>{a.action}</p>
                <div className="text-[9px] text-gray-600 font-mono mt-0.5 flex gap-2">
                  <span>{a.user}</span><span>•</span><span>{a.module}</span><span>•</span>
                  <span>{new Date(a.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
