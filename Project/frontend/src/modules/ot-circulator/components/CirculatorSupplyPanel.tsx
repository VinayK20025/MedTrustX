'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { SupplyItem } from '../types/circulator.types';
import { PackageSearch, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { supplies: SupplyItem[]; }

export function CirculatorSupplyPanel({ supplies }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/15"><PackageSearch className="w-4 h-4 text-teal-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">OT Supply Management</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[350px]">
        <div className="divide-y divide-white/[0.03]">
          {supplies.map(item => (
            <div key={item.id} className="p-4 hover:bg-white/[0.015] transition-colors flex items-center justify-between">
              <div>
                <h4 className={cn("text-[13px] font-bold flex items-center gap-2", item.status === 'Out of Stock' ? 'text-emergency-light' : 'text-white')}>
                  {item.name}
                  {(item.status === 'Low Stock' || item.status === 'Out of Stock') && <AlertCircle className="w-3.5 h-3.5 text-warning-light" />}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] uppercase font-bold text-gray-500">{item.category}</span>
                  <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400 font-mono">Loc: {item.location}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  item.status === 'In Stock' ? 'bg-success/20 text-success-light' : 
                  item.status === 'Low Stock' ? 'bg-warning/20 text-warning-light' : 'bg-emergency/20 text-emergency-light'
                )}>
                  {item.status}
                </span>
                <span className="text-[11px] font-mono text-gray-300">Qty: {item.quantityAvailable}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
