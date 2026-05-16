'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ClaimReconciliation, PreAuthRequest } from '../types/insurance.types';
import { useResolveMismatch } from '../hooks/useInsuranceAnalytics';
import { Scale, ShieldCheck, CheckCircle2, Clock, AlertTriangle, Wrench, Ban } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { reconciliation: ClaimReconciliation[]; preAuths: PreAuthRequest[]; }

const reconColor: Record<ClaimReconciliation['status'], { bg: string; text: string }> = {
  Settled: { bg: 'bg-success/10', text: 'text-success-light' },
  Partial: { bg: 'bg-blue-500/10', text: 'text-blue-300' },
  Pending: { bg: 'bg-warning/10', text: 'text-warning-light' },
  Mismatch: { bg: 'bg-emergency/10', text: 'text-emergency-light' },
};

export function InsuranceStatusPanel({ reconciliation, preAuths }: Props) {
  const { mutate: resolve, isPending } = useResolveMismatch();
  const issues = reconciliation.filter(r => r.status === 'Mismatch');

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Pre-Auth */}
      <Card className="border-white/[0.06] shadow-glass bg-surface-light flex-[0.8] flex flex-col">
        <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <h3 className="text-[12px] font-bold tracking-widest text-emerald-400">PRE-AUTHORIZATIONS</h3>
        </CardHeader>
        <CardBody className="p-0 flex-1 overflow-y-auto">
          <div className="divide-y divide-white/[0.03]">
            {preAuths.map(pa => (
              <div key={pa.id} className="p-3">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-[12px] font-bold text-white">{pa.patientName}</h4>
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded",
                    pa.status === 'Approved' ? 'bg-success/20 text-success-light' :
                    pa.status === 'Denied' ? 'bg-emergency/20 text-emergency-light' : 'bg-warning/20 text-warning-light'
                  )}>{pa.status}</span>
                </div>
                <div className="text-[10px] text-gray-500 font-mono">
                  {pa.procedure} • {pa.insurer} • ₹{pa.estimatedCost.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Reconciliation */}
      <Card className={cn("shadow-glass flex-1 flex flex-col", issues.length > 0 ? "border-warning/25" : "border-white/[0.06]")}>
        <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-[12px] font-bold tracking-widest text-amber-400">RECONCILIATION</h3>
          </div>
          {issues.length > 0 && <span className="text-[9px] bg-emergency/20 text-emergency-light px-2 py-0.5 rounded font-bold">{issues.length} mismatch</span>}
        </CardHeader>
        <CardBody className="p-0 flex-1 overflow-y-auto">
          <div className="divide-y divide-white/[0.03]">
            {reconciliation.map(r => {
              const rc = reconColor[r.status];
              return (
                <div key={r.id} className={cn("p-3", r.status === 'Mismatch' && "bg-emergency/[0.03]")}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[12px] font-bold text-white">{r.patientName}</span>
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", rc.bg, rc.text)}>{r.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-gray-500 mt-1">
                    <span>Claim: ₹{(r.claimAmount/1000).toFixed(0)}K</span>
                    <span>Apprvd: ₹{(r.approvedAmount/1000).toFixed(0)}K</span>
                    <span>Rcvd: ₹{(r.receivedAmount/1000).toFixed(0)}K</span>
                  </div>
                  {r.variance > 0 && r.status === 'Mismatch' && (
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-emergency-light font-mono font-bold">Δ ₹{r.variance.toLocaleString()}</span>
                      <Button size="sm" disabled={isPending} onClick={() => resolve(r.id)} className="h-6 text-[9px] bg-white/5 hover:bg-white/10 text-gray-300" leftIcon={<Wrench className="w-2.5 h-2.5" />}>Fix</Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
