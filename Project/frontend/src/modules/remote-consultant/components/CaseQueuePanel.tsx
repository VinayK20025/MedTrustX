'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ConsultCase } from '../types/remote-consultant.types';
import { Stethoscope, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { cases: ConsultCase[]; selectedId?: string; onSelect: (id: string) => void; }

const priorityColor: Record<string, string> = {
  Urgent: 'bg-emergency/15 text-emergency-light border-emergency/30',
  High: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  Routine: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
};
const statusBorder: Record<string, string> = {
  Pending: 'border-warning bg-warning/[0.04]',
  'In Review': 'border-blue-500 bg-blue-500/[0.04]',
  'Opinion Sent': 'border-success bg-success/[0.04]',
  Closed: 'border-gray-500 bg-gray-500/[0.04]',
};

export function CaseQueuePanel({ cases, selectedId, onSelect }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-amber-400" /> Case Queue
        </h3>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">
          {cases.filter(c => c.status === 'Pending').length} Pending
        </span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {cases.map(c => (
            <div key={c.id} onClick={() => onSelect(c.id)}
              className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                statusBorder[c.status],
                selectedId === c.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
              )}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-gray-400">{c.id}</span>
                <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider border', priorityColor[c.priority])}>
                  {c.priority === 'Urgent' && <AlertTriangle className="w-2.5 h-2.5 inline mr-0.5 -mt-0.5" />}
                  {c.priority}
                </span>
              </div>

              <h4 className="text-[14px] font-bold text-white mb-0.5">{c.patientName}</h4>
              <p className="text-[10px] text-gray-400 mb-1">{c.age}y {c.gender} • {c.specialty}</p>
              <p className="text-[11px] text-gray-300 line-clamp-2 leading-snug">{c.summary}</p>

              <div className="flex justify-between items-center text-[10px] mt-3 pt-2 border-t border-white/5">
                <span className="text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(c.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-gray-500">Ref: {c.referredBy.split('(')[0].trim()}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
