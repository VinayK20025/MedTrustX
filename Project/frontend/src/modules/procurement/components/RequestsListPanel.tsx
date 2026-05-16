'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { PurchaseRequest } from '../types/procurement.types';
import { ClipboardList, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { requests: PurchaseRequest[]; selectedId?: string; onSelect: (id: string) => void; }

const priorityColor = { Critical: 'border-emergency bg-emergency/[0.04]', High: 'border-orange-500 bg-orange-500/[0.04]', Normal: 'border-blue-500 bg-blue-500/[0.04]' };

export function RequestsListPanel({ requests, selectedId, onSelect }: Props) {
  const pendingRequests = requests.filter(r => r.status === 'Pending Review');

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-emerald-400" /> Pending Purchase Requests
        </h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        {pendingRequests.length === 0 ? (
          <div className="p-6 text-center text-gray-500 italic">No pending requests.</div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {pendingRequests.map(r => (
              <div key={r.id} onClick={() => onSelect(r.id)}
                className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                  priorityColor[r.priority],
                  selectedId === r.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
                )}>
                
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {r.priority === 'Critical' && <AlertTriangle className="w-3.5 h-3.5 text-emergency-light" />}
                    <span className="text-[10px] font-mono text-gray-400">{r.id}</span>
                  </div>
                  <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider',
                    r.priority === 'Critical' ? 'bg-emergency/15 text-emergency-light' : 
                    r.priority === 'High' ? 'bg-orange-500/15 text-orange-400' : 'bg-blue-500/15 text-blue-300'
                  )}>{r.priority}</span>
                </div>

                <h4 className="text-[13px] font-bold text-white mb-1">{r.item}</h4>
                <p className="text-[11px] font-semibold text-gray-300 mb-2">Qty: {r.quantity}</p>
                
                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-2 border-t border-white/5">
                  <span className="bg-black/30 px-1.5 py-0.5 rounded uppercase tracking-widest">{r.category}</span>
                  <span>{r.department}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
