'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { WardSnapshot } from '../types/deputy-ms.types';
import { Bed } from 'lucide-react';

interface Props { wards: WardSnapshot[]; }

const statusDot: Record<string, string> = { normal: 'bg-success', high: 'bg-warning', full: 'bg-emergency animate-pulse' };

export function WardMiniPanel({ wards }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <Bed className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Ward Status</h3>
          <p className="text-xs text-gray-400 mt-0.5">{wards.reduce((a, w) => a + w.available, 0)} beds free across {wards.length} wards</p>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-2.5">
        {wards.map(w => {
          const pct = Math.round((w.occupied / w.totalBeds) * 100);
          return (
            <div key={w.id} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${statusDot[w.status]}`} />
                  <span className="text-xs font-semibold text-white">{w.name}</span>
                </div>
                <span className={`text-xs font-black font-mono ${w.available === 0 ? 'text-emergency-light' : w.available <= 2 ? 'text-warning-light' : 'text-success-light'}`}>{w.available} free</span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden mb-1.5">
                <div className={`h-full rounded-full ${pct >= 95 ? 'bg-emergency' : pct >= 80 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex gap-x-4 text-[10px] text-gray-500 font-mono">
                <span>D/C: <span className={w.pendingDischarges > 5 ? 'text-warning-light font-bold' : 'text-gray-300'}>{w.pendingDischarges}</span></span>
                {w.criticalCount > 0 && <span>Crit: <span className="text-emergency-light font-bold">{w.criticalCount}</span></span>}
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
