'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SupplyIssue } from '../types/supply-chain.types';
import { useEscalateIssue } from '../hooks/useSupplyChainAnalytics';
import { ShieldAlert, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { issues: SupplyIssue[]; }

export function SupplyAlertsPanel({ issues }: Props) {
  const { mutate: escalate } = useEscalateIssue();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emergency-light" /> Bottlenecks & Shortages
        </h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {issues.length === 0 ? <p className="text-[12px] text-gray-500 italic">No active bottlenecks.</p> : issues.map(iss => (
            <div key={iss.id} className={cn('rounded-xl border p-4 transition-all',
              iss.status === 'Open' ? 'bg-emergency/[0.05] border-emergency/30' : 'bg-white/[0.02] border-white/10'
            )}>
              <div className="flex items-start justify-between mb-2">
                <span className={cn('text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-widest',
                  iss.impact === 'High' ? 'bg-emergency/20 text-emergency-light' : 'bg-warning/20 text-warning-light'
                )}>{iss.impact} Impact</span>
                <span className={cn('text-[9px] font-bold uppercase', iss.status === 'Open' ? 'text-emergency-light animate-pulse' : 'text-gray-500')}>{iss.status}</span>
              </div>

              <h4 className="text-[13px] font-bold text-white mb-1 leading-snug">{iss.type}: {iss.item}</h4>
              <p className="text-[10px] text-gray-500 mb-3">Reported: {new Date(iss.reportedAt).toLocaleString()}</p>

              {iss.status === 'Open' && (
                <Button onClick={() => escalate(iss.id)} className="w-full h-8 text-[11px] bg-emergency/20 hover:bg-emergency/30 text-emergency-light border border-emergency/40" leftIcon={<ArrowUpCircle className="w-3.5 h-3.5" />}>Escalate to Management</Button>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
