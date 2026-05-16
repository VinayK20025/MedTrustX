'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { BulkIssueRequest } from '../types/non-medical-store.types';
import { ClipboardList, LayoutGrid } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { requests: BulkIssueRequest[]; selectedId?: string; onSelect: (id: string) => void; }

const categoryColor = { Housekeeping: 'border-blue-500 bg-blue-500/[0.04]', Maintenance: 'border-orange-500 bg-orange-500/[0.04]', Admin: 'border-purple-500 bg-purple-500/[0.04]' };

export function BulkTasksPanel({ requests, selectedId, onSelect }: Props) {
  const activeReqs = requests.filter(r => r.status !== 'Issued');

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-emerald-400" /> Facility Requests
        </h3>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">{activeReqs.length}</span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {activeReqs.map(r => (
            <div key={r.id} onClick={() => onSelect(r.id)}
              className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                categoryColor[r.category],
                selectedId === r.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
              )}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-gray-500">{r.id}</span>
                <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex items-center gap-1',
                  r.category === 'Housekeeping' ? 'bg-blue-500/15 text-blue-300' :
                  r.category === 'Maintenance' ? 'bg-orange-500/15 text-orange-400' : 'bg-purple-500/15 text-purple-300'
                )}>
                  <LayoutGrid className="w-2.5 h-2.5" />
                  {r.category}
                </span>
              </div>
              
              <h4 className="text-[13px] font-bold text-white mb-0.5">{r.department}</h4>
              <p className="text-[11px] text-gray-400 mb-2">{r.items.length} unique items requested</p>
              
              <div className="flex items-center justify-between text-[11px] font-bold mt-2 pt-2 border-t border-white/5">
                <span className={cn('uppercase', r.status === 'Picking' ? 'text-warning-light' : 'text-gray-500')}>{r.status}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
