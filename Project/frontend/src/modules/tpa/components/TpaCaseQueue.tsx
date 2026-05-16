'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { TpaCase, TpaPipelineStage } from '../types/tpa.types';
import { Network, Search, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { cases: TpaCase[]; selectedId?: string; onSelect: (id: string) => void; }

const stageColor: Record<TpaPipelineStage, string> = {
  Request: 'bg-gray-500/20 text-gray-300',
  Submitted: 'bg-blue-500/20 text-blue-300',
  'Under Review': 'bg-indigo-500/20 text-indigo-300',
  'Additional Info': 'bg-amber-500/20 text-amber-300',
  Approved: 'bg-success/20 text-success-light',
  Rejected: 'bg-emergency/20 text-emergency-light',
  'Final Approval': 'bg-teal-500/20 text-teal-300',
};

export function TpaCaseQueue({ cases, selectedId, onSelect }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-blue-500/15"><Network className="w-3.5 h-3.5 text-blue-400" /></div>
          <h3 className="text-[13px] font-bold text-white tracking-wide">Case Queue</h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input type="text" placeholder="Search by patient or insurer..." className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-[11px] text-white focus:outline-none focus:border-blue-500/50" />
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {cases.map(c => {
            const isDelayed = c.agingHours > 24 && c.stage !== 'Approved' && c.stage !== 'Final Approval' && c.stage !== 'Rejected';
            return (
              <div key={c.id} onClick={() => onSelect(c.id)}
                className={cn("p-4 cursor-pointer transition-all border-l-2 relative",
                  selectedId === c.id ? "bg-blue-500/[0.06] border-l-blue-500" :
                  c.stage === 'Rejected' ? "bg-emergency/[0.02] border-l-emergency hover:bg-emergency/[0.04]" :
                  "border-l-transparent hover:bg-white/[0.015]"
                )}>
                {c.priority === 'Emergency' && <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emergency-light animate-pulse m-2" />}
                <div className="flex justify-between items-start mb-1 pr-3">
                  <div>
                    <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                      {c.patientName}
                      {c.type === 'Discharge' && <span className="text-[8px] bg-teal-500/20 text-teal-300 px-1 py-0.5 rounded uppercase tracking-wider">DC Block</span>}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5 flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5" /> {c.insurer}
                    </p>
                  </div>
                  <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider whitespace-nowrap', stageColor[c.stage])}>{c.stage}</span>
                </div>
                <div className="flex justify-between text-[11px] font-mono mt-2">
                  <span className="text-gray-400 font-bold">{c.type}</span>
                  <span className={cn(isDelayed ? "text-emergency-light font-bold flex items-center gap-1" : "text-gray-500")}>
                    {isDelayed && <AlertTriangle className="w-3 h-3" />} {c.agingHours}h aging
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
