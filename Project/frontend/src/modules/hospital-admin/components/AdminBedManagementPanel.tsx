'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { BedOccupancyData } from '../types/admin.types';
import { useTriggerBedDiversion } from '../hooks/useAdminAnalytics';
import { BedDouble, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { beds: BedOccupancyData[]; }

export function AdminBedManagementPanel({ beds }: Props) {
  const { mutate: divert, isPending } = useTriggerBedDiversion();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/15"><BedDouble className="w-4 h-4 text-blue-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Live Bed Occupancy</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {beds.map(b => (
            <div key={b.department} className={cn("p-5 transition-colors", b.status === 'Full' ? "bg-emergency/5 border-l-2 border-emergency" : "hover:bg-white/[0.015]")}>
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                  {b.department}
                  {b.status === 'Full' && <AlertTriangle className="w-4 h-4 text-emergency-light animate-pulse" />}
                </h4>
                <span className={cn('text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  b.status === 'Full' ? 'bg-emergency/20 text-emergency-light' : 
                  b.status === 'Nearing Capacity' ? 'bg-warning/20 text-warning-light' : 'bg-success/20 text-success-light'
                )}>
                  {b.status}
                </span>
              </div>

              <div className="mb-4">
                 <div className="flex justify-between text-[11px] mb-1">
                   <span className="text-gray-400">Occupancy</span>
                   <span className="text-white font-mono">{b.occupiedBeds} / {b.totalBeds} Beds ({b.occupancyRate}%)</span>
                 </div>
                 <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                   <div className={cn("h-full transition-all duration-1000", b.occupancyRate >= 95 ? "bg-emergency-500" : b.occupancyRate >= 80 ? "bg-warning-500" : "bg-success-500")} style={{ width: `${b.occupancyRate}%` }} />
                 </div>
              </div>

              {b.status === 'Full' && (
                <div className="flex justify-end pt-2 border-t border-white/5">
                  <Button 
                    size="sm" 
                    disabled={isPending}
                    onClick={() => divert(b.department)}
                    className="bg-emergency/10 hover:bg-emergency/20 text-emergency-light border border-emergency/30 text-[10px] h-7"
                    leftIcon={<ArrowRightLeft className="w-3 h-3"/>}
                  >
                    Divert Admissions
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
