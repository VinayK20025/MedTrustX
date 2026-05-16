'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { IssueRequest } from '../types/storekeeper.types';
import { ClipboardList, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { requests: IssueRequest[]; selectedId?: string; onSelect: (id: string) => void; }

const priorityColor = { Urgent: 'border-emergency bg-emergency/[0.04]', Routine: 'border-blue-500 bg-blue-500/[0.04]' };

export function StoreTasksPanel({ requests, selectedId, onSelect }: Props) {
  const activeReqs = requests.filter(r => r.status !== 'Issued');

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-blue-400" /> Dispatch Queue
        </h3>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">{activeReqs.length}</span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {activeReqs.map(r => (
            <div key={r.id} onClick={() => onSelect(r.id)}
              className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                priorityColor[r.priority],
                selectedId === r.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
              )}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-gray-500">{r.id}</span>
                <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider flex items-center gap-1',
                  r.priority === 'Urgent' ? 'bg-emergency/15 text-emergency-light' : 'bg-blue-500/15 text-blue-300'
                )}>
                  {r.priority === 'Urgent' && <AlertTriangle className="w-2.5 h-2.5" />}
                  {r.priority}
                </span>
              </div>
              
              <h4 className="text-[13px] font-bold text-white mb-1.5 leading-snug">{r.item}</h4>
              
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[11px]">
                <span className="text-gray-400">Dept: <strong className="text-gray-300">{r.department}</strong></span>
                <span className="text-white font-bold bg-black/30 px-2 py-0.5 rounded border border-white/10">Qty: {r.requestedQty}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
