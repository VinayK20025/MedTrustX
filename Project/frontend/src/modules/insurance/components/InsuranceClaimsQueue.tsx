'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { InsuranceClaim, ClaimPipelineStage } from '../types/insurance.types';
import { Inbox, Search } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { claims: InsuranceClaim[]; selectedId?: string; onSelect: (id: string) => void; }

const stageColor: Record<ClaimPipelineStage, string> = {
  Draft: 'bg-gray-500/20 text-gray-300',
  Submitted: 'bg-blue-500/20 text-blue-300',
  'Under Review': 'bg-indigo-500/20 text-indigo-300',
  Approved: 'bg-success/20 text-success-light',
  Rejected: 'bg-emergency/20 text-emergency-light',
  Paid: 'bg-success/10 text-success-light',
  Appealed: 'bg-violet-500/20 text-violet-300',
};

export function InsuranceClaimsQueue({ claims, selectedId, onSelect }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-blue-500/15"><Inbox className="w-3.5 h-3.5 text-blue-400" /></div>
          <h3 className="text-[13px] font-bold text-white tracking-wide">Claims Queue</h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input type="text" placeholder="Search by patient or insurer..." className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-[11px] text-white focus:outline-none focus:border-blue-500/50" />
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {claims.map(c => (
            <div key={c.id} onClick={() => onSelect(c.id)}
              className={cn("p-4 cursor-pointer transition-all border-l-2",
                selectedId === c.id ? "bg-blue-500/[0.06] border-l-blue-500" :
                c.stage === 'Rejected' ? "bg-emergency/[0.02] border-l-emergency hover:bg-emergency/[0.04]" :
                "border-l-transparent hover:bg-white/[0.015]"
              )}>
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h4 className="text-[13px] font-bold text-white">{c.patientName}</h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">{c.insurer} • {c.id}</p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', stageColor[c.stage])}>{c.stage}</span>
              </div>
              <div className="flex justify-between text-[11px] font-mono mt-2">
                <span className="text-white font-bold">₹{c.claimAmount.toLocaleString()}</span>
                {c.agingDays > 7 && <span className="text-warning-light">{c.agingDays}d aging</span>}
              </div>
              {c.validationIssues.length > 0 && (
                <span className="text-[9px] text-warning-light mt-1 block">⚠ {c.validationIssues.length} issue(s)</span>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
