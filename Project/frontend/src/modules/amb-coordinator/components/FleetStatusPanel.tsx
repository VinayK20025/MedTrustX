'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { AmbulanceUnit } from '../types/amb-coordinator.types';
import { Ambulance, RadioReceiver } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { fleet: AmbulanceUnit[]; }

export function FleetStatusPanel({ fleet }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col relative">
      <CardHeader className="border-b border-white/[0.04] p-4 flex justify-between items-center bg-black/30">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <Ambulance className="w-4 h-4 text-emerald-400" /> Fleet Status
        </h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.05]">
           {fleet.map(unit => (
              <div key={unit.id} className="p-4 bg-black/20">
                 <div className="flex justify-between items-start mb-2">
                    <span className="text-[14px] font-black text-white">{unit.callSign}</span>
                    <span className={cn('text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border',
                       unit.status === 'Available' ? 'bg-success/10 text-success-light border-success/30' :
                       unit.status === 'En Route' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                       unit.status === 'Transporting' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-white/5 text-gray-400 border-white/10'
                    )}>
                       {unit.status}
                    </span>
                 </div>
                 
                 <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-2">
                    <RadioReceiver className="w-3 h-3" /> {unit.currentLocation}
                 </div>

                 {unit.etaToTarget && (
                    <div className="text-[10px] font-bold text-gray-500 bg-white/[0.02] px-2 py-1 rounded inline-block">
                       ETA to Target: <span className="text-white">{unit.etaToTarget}</span>
                    </div>
                 )}
              </div>
           ))}
        </div>
      </CardBody>
    </Card>
  );
}
