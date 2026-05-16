'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { BedStatus } from '../types/operations.types';
import { Bed, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { beds: BedStatus[]; }

export function BedManagementPanel({ beds }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-blue-500/15"><Bed className="w-3.5 h-3.5 text-blue-400" /></div>
          <h3 className="text-[13px] font-bold text-white tracking-wide">Bed Occupancy</h3>
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {beds.map(b => {
            const isCritical = b.occupancyRate >= 90;
            return (
              <div key={b.department} className={cn("p-4", isCritical && "bg-emergency/[0.02]")}>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-[12px] font-bold text-white flex items-center gap-1.5">
                    {b.department}
                    {isCritical && <AlertCircle className="w-3.5 h-3.5 text-emergency-light" />}
                  </h4>
                  <span className={cn("text-[11px] font-mono font-bold px-2 py-0.5 rounded", isCritical ? "bg-emergency/20 text-emergency-light" : "bg-white/10 text-white")}>
                    {b.occupancyRate}%
                  </span>
                </div>
                
                {/* Visual Bed Breakdown */}
                <div className="w-full flex h-2 rounded-full overflow-hidden mb-2 gap-0.5">
                  <div className="bg-blue-500" style={{ width: `${(b.occupied / b.total) * 100}%` }} title="Occupied" />
                  <div className="bg-amber-500" style={{ width: `${(b.cleaning / b.total) * 100}%` }} title="Cleaning" />
                  <div className="bg-emerald-500/30" style={{ width: `${(b.available / b.total) * 100}%` }} title="Available" />
                </div>

                <div className="flex justify-between text-[10px] font-mono text-gray-500 mt-2">
                  <span>Occ: {b.occupied}</span>
                  <span className="text-amber-400/80">Cln: {b.cleaning}</span>
                  <span className="text-emerald-400">Avail: {b.available}</span>
                  <span className="text-gray-400">Total: {b.total}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
