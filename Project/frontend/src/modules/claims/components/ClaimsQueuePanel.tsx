'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ClaimDetails, ClaimPipelineStage } from '../types/claims.types';
import { ListTodo, Search, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { claims: ClaimDetails[]; selectedId?: string; onSelect: (id: string) => void; }

const stageColor: Record<ClaimPipelineStage, string> = {
  Draft: 'bg-gray-500/20 text-gray-300',
  Submitted: 'bg-blue-500/20 text-blue-300',
  'Under Review': 'bg-indigo-500/20 text-indigo-300',
  Approved: 'bg-teal-500/20 text-teal-300',
  Rejected: 'bg-emergency/20 text-emergency-light',
  Paid: 'bg-success/20 text-success-light',
};

const agingBucketColor: Record<string, string> = {
  '0-7': 'text-gray-400',
  '8-30': 'text-amber-400',
  '30+': 'text-emergency-light font-bold',
};

export function ClaimsQueuePanel({ claims, selectedId, onSelect }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-amber-500/15"><ListTodo className="w-3.5 h-3.5 text-amber-400" /></div>
          <h3 className="text-[13px] font-bold text-white tracking-wide">Claims Queue</h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input type="text" placeholder="Search claims or patient..." className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-[11px] text-white focus:outline-none focus:border-amber-500/50" />
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {claims.map(c => (
            <div key={c.id} onClick={() => onSelect(c.id)}
              className={cn("p-4 cursor-pointer transition-all border-l-2 relative",
                selectedId === c.id ? "bg-amber-500/[0.06] border-l-amber-500" :
                c.stage === 'Rejected' ? "bg-emergency/[0.02] border-l-emergency hover:bg-emergency/[0.04]" :
                c.agingBucket === '30+' && c.stage !== 'Paid' ? "border-l-emergency/50 hover:bg-white/[0.015]" :
                "border-l-transparent hover:bg-white/[0.015]"
              )}>
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h4 className="text-[13px] font-bold text-white">{c.patientName}</h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">{c.insurer} • {c.id}</p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', stageColor[c.stage])}>{c.stage}</span>
              </div>
              <div className="flex justify-between text-[11px] font-mono mt-2 items-center">
                <span className="text-white font-bold">₹{c.claimAmount.toLocaleString()}</span>
                <span className={cn("flex items-center gap-1", agingBucketColor[c.agingBucket])}>
                  <Clock className="w-3 h-3" /> {c.agingDays}d
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
