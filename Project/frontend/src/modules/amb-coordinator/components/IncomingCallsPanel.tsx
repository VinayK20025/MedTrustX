'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { EmergencyCall } from '../types/amb-coordinator.types';
import { PhoneIncoming, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { calls: EmergencyCall[]; selectedId?: string; onSelect: (id: string) => void; }

const priorityColor = { Critical: 'border-emergency bg-emergency/[0.04]', Urgent: 'border-warning bg-warning/[0.04]', Routine: 'border-blue-500 bg-blue-500/[0.04]' };

export function IncomingCallsPanel({ calls, selectedId, onSelect }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <PhoneIncoming className="w-4 h-4 text-emerald-400" /> Dispatch Queue
        </h3>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">{calls.length} Active</span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {calls.map(c => (
            <div key={c.id} onClick={() => onSelect(c.id)}
              className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                priorityColor[c.priority],
                selectedId === c.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
              )}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-gray-400">{c.id}</span>
                <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex items-center gap-1 tracking-wider',
                  c.priority === 'Critical' ? 'bg-emergency/15 text-emergency-light animate-pulse' : 
                  c.priority === 'Urgent' ? 'bg-warning/15 text-warning-light' : 'bg-blue-500/15 text-blue-300'
                )}>
                  {c.priority === 'Critical' && <AlertTriangle className="w-2.5 h-2.5" />}
                  {c.priority}
                </span>
              </div>
              
              <h4 className="text-[14px] font-bold text-white mb-0.5">{c.condition}</h4>
              <p className="text-[12px] text-gray-400 mb-2 truncate">{c.location}</p>

              <div className="flex justify-between items-center text-[10px] mt-2 pt-2 border-t border-white/5">
                 <span className="text-gray-500">{Math.floor((Date.now() - new Date(c.receivedAt).getTime()) / 60000)}m ago</span>
                 <span className={cn('font-bold uppercase tracking-wider', c.status === 'Pending Dispatch' ? 'text-emergency-light' : 'text-emerald-400')}>{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
