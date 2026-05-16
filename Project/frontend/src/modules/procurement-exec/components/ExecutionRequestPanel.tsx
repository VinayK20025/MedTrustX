'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ExecPurchaseRequest } from '../types/procurement-exec.types';
import { ShoppingCart, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { requests: ExecPurchaseRequest[]; selectedId?: string; onSelect: (id: string) => void; }

const priorityColor = { Critical: 'border-emergency bg-emergency/[0.04]', High: 'border-orange-500 bg-orange-500/[0.04]', Normal: 'border-blue-500 bg-blue-500/[0.04]' };

export function ExecutionRequestPanel({ requests, selectedId, onSelect }: Props) {
  const pending = requests.filter(r => r.status === 'Approved' || r.status === 'Processing');

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-emerald-400" /> Pending Execution
        </h3>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">{pending.length}</span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {pending.map(r => (
            <div key={r.id} onClick={() => onSelect(r.id)}
              className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                priorityColor[r.priority],
                selectedId === r.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
              )}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-gray-400">{r.id}</span>
                <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider',
                  r.priority === 'Critical' ? 'bg-emergency/15 text-emergency-light border border-emergency/30' : 
                  r.priority === 'High' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' : 'bg-blue-500/15 text-blue-300'
                )}>{r.priority}</span>
              </div>
              <h4 className="text-[13px] font-bold text-white mb-1.5 leading-snug pr-4">{r.item}</h4>
              <div className="flex items-center gap-4 text-[10px] text-gray-500 mt-2">
                <span className="text-gray-300 font-bold">Qty: {r.quantity}</span>
                <span>{r.department}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
