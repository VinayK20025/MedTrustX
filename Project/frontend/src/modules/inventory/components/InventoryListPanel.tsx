'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { InventoryItem } from '../types/inventory.types';
import { PackageSearch, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { items: InventoryItem[]; selectedId?: string; onSelect: (id: string) => void; }

const statusColor = { Critical: 'border-emergency bg-emergency/[0.04]', Low: 'border-warning-light bg-warning/[0.04]', Optimal: 'border-success-light bg-success/[0.02]', Overstock: 'border-blue-500 bg-blue-500/[0.04]' };

export function InventoryListPanel({ items, selectedId, onSelect }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <PackageSearch className="w-4 h-4 text-blue-400" /> Stock Registry
        </h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {items.map(item => (
            <div key={item.id} onClick={() => onSelect(item.id)}
              className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                statusColor[item.status],
                selectedId === item.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
              )}>
              
              <div className="flex items-start justify-between mb-1.5">
                <span className="text-[10px] font-mono text-gray-500">{item.id}</span>
                <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider flex items-center gap-1',
                  item.status === 'Critical' ? 'bg-emergency/15 text-emergency-light border border-emergency/30' : 
                  item.status === 'Low' ? 'bg-warning/15 text-warning-light border border-warning/30' : 
                  item.status === 'Optimal' ? 'bg-success/10 text-success-light' : 'bg-blue-500/15 text-blue-300'
                )}>
                  {item.status === 'Critical' && <AlertTriangle className="w-2.5 h-2.5" />}
                  {item.status}
                </span>
              </div>

              <h4 className="text-[13px] font-bold text-white mb-1.5 leading-snug pr-4">{item.name}</h4>
              
              <div className="flex items-center gap-4 text-[10px] text-gray-400 mt-2">
                <span className="bg-black/30 px-1.5 py-0.5 rounded border border-white/5 uppercase">{item.category}</span>
                <span>{item.location}</span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold mt-3 pt-2 border-t border-white/5">
                 <span className={cn(item.status === 'Critical' || item.status === 'Low' ? 'text-warning-light' : 'text-success-light')}>
                   {item.currentStock} {item.unit}
                 </span>
                 <span className="text-gray-500">Min: {item.minimumStock}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
