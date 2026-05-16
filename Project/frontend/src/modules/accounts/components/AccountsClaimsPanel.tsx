'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { InsuranceClaimAccounts } from '../types/accounts.types';
import { useAppealClaim } from '../hooks/useAccountsAnalytics';
import { ShieldCheck, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { claims: InsuranceClaimAccounts[]; }

const claimStatusStyle: Record<InsuranceClaimAccounts['status'], { bg: string; text: string }> = {
  Pending: { bg: 'bg-warning/20', text: 'text-warning-light' },
  Approved: { bg: 'bg-blue-500/20', text: 'text-blue-300' },
  Settled: { bg: 'bg-success/20', text: 'text-success-light' },
  Rejected: { bg: 'bg-emergency/20', text: 'text-emergency-light' },
  Appealed: { bg: 'bg-violet-500/20', text: 'text-violet-300' },
};

export function AccountsClaimsPanel({ claims }: Props) {
  const { mutate: appeal, isPending } = useAppealClaim();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
        <h3 className="text-[13px] font-bold text-white tracking-wide">Insurance Claims</h3>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {claims.map(c => {
            const st = claimStatusStyle[c.status];
            return (
              <div key={c.id} className={cn("p-4", c.agingDays > 7 && c.status === 'Pending' && "border-l-2 border-l-warning")}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-[12px] font-bold text-white">{c.patientName}</h4>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{c.provider} • Aging: {c.agingDays}d</p>
                  </div>
                  <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', st.bg, st.text)}>{c.status}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-gray-400">Claim: ₹{c.claimAmount.toLocaleString()}</span>
                  {c.settledAmount && <span className="text-success-light">Settled: ₹{c.settledAmount.toLocaleString()}</span>}
                  {c.status === 'Rejected' && (
                    <Button size="sm" disabled={isPending} onClick={() => appeal(c.id)} className="h-7 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 text-[10px] border border-violet-500/20" leftIcon={<RotateCcw className="w-3 h-3" />}>Appeal</Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
