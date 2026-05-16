'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { BloodGroupStock } from '../types/blood-bank.types';
import { Droplets, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { stock: BloodGroupStock[]; }

const stockColor: Record<string, { bg: string; text: string; bar: string }> = {
  Adequate: { bg: 'bg-success/10 border-success/30', text: 'text-success-light', bar: 'bg-emerald-500' },
  Low: { bg: 'bg-warning/10 border-warning/30', text: 'text-warning-light', bar: 'bg-warning' },
  Critical: { bg: 'bg-emergency/10 border-emergency/30', text: 'text-emergency-light', bar: 'bg-emergency' },
};

export function InventoryPanel({ stock }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <Droplets className="w-4 h-4 text-red-400" /> Blood Inventory
        </h3>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">
          {stock.reduce((a, s) => a + s.units, 0)} Total Units
        </span>
      </CardHeader>

      <CardBody className="p-3 flex-1 overflow-y-auto space-y-2">
        {stock.map(s => {
          const style = stockColor[s.status];
          const pct = Math.min((s.units / (s.threshold * 3)) * 100, 100);
          return (
            <div key={s.group} className={cn('border rounded-xl p-3', style.bg)}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[20px] font-black text-white font-mono">{s.group}</span>
                  {s.status === 'Critical' && <AlertTriangle className="w-3.5 h-3.5 text-emergency-light animate-pulse" />}
                </div>
                <div className="text-right">
                  <span className={cn('text-[18px] font-black font-mono', style.text)}>{s.units}</span>
                  <span className="text-[10px] text-gray-500 ml-1">/ {s.threshold} min</span>
                </div>
              </div>
              <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div className={cn('h-full transition-all rounded-full', style.bar)} style={{ width: `${pct}%` }} />
              </div>
              <p className={cn('text-[9px] font-bold uppercase tracking-widest mt-1.5', style.text)}>{s.status}</p>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
