'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { DeputyShiftUpdate } from '../types/deputy.types';
import { Activity, ArrowRightRight } from 'lucide-react';

interface Props { updates: DeputyShiftUpdate[]; }

export function DeputyShiftPanel({ updates }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-white tracking-wide">Live Shift Execution</h3>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {updates.map(u => (
          <div key={u.id} className="p-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5">
            <div className="flex justify-between items-center mb-2">
               <span className="text-sm font-bold text-white">{u.nurseName}</span>
               <span className="text-[9px] text-indigo-300 font-mono">{u.time}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300">
               <span className="text-indigo-400 uppercase tracking-widest text-[10px] font-bold">{u.action}</span>
               {u.fromWard && (
                 <>
                   <span className="bg-surface-dark px-1.5 py-0.5 rounded">{u.fromWard}</span>
                   <ArrowRightRight className="w-3 h-3 text-gray-500" />
                 </>
               )}
               <span className="bg-indigo-500/20 text-indigo-200 px-1.5 py-0.5 rounded">{u.toWard}</span>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
