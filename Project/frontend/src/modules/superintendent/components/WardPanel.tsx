'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { WardStatus } from '../types/superintendent.types';
import { Bed } from 'lucide-react';

interface Props { wards: WardStatus[]; }

const statusDot: Record<string, string> = {
  normal: 'bg-success',
  high:   'bg-warning',
  full:   'bg-emergency animate-pulse',
};

export function WardPanel({ wards }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <Bed className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Ward Status</h3>
          <p className="text-xs text-gray-400 mt-0.5">{wards.length} wards • bed occupancy grid</p>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3">
        {wards.map(w => (
          <div key={w.id} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:border-white/[0.08] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${statusDot[w.status]}`} />
                <span className="text-sm font-semibold text-white">{w.name}</span>
              </div>
              <span className={`text-sm font-black font-mono ${w.occupancyPct >= 95 ? 'text-emergency-light' : w.occupancyPct >= 80 ? 'text-warning-light' : 'text-success-light'}`}>{w.occupancyPct}%</span>
            </div>
            <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden mb-2">
              <div className={`h-full rounded-full transition-all duration-500 ${w.occupancyPct >= 95 ? 'bg-emergency' : w.occupancyPct >= 80 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${w.occupancyPct}%` }} />
            </div>
            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono">
              <div><span className="text-gray-500 block">Total</span><span className="text-gray-300">{w.totalBeds}</span></div>
              <div><span className="text-gray-500 block">Occ.</span><span className="text-gray-300">{w.occupied}</span></div>
              <div><span className="text-gray-500 block">Avail</span><span className={w.available === 0 ? 'text-emergency-light font-bold' : 'text-success-light'}>{w.available}</span></div>
              <div><span className="text-gray-500 block">D/C Pend</span><span className={w.pendingDischarges > 5 ? 'text-warning-light font-bold' : 'text-gray-300'}>{w.pendingDischarges}</span></div>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
