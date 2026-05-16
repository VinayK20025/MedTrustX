'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { PlumbingSystem } from '../types/plumber.types';
import { Droplets, CloudFog, Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { systems: PlumbingSystem[]; }

const typeIcon: Record<string, React.ReactNode> = {
  Water: <Droplets className="w-4 h-4" />,
  Drainage: <Trash2 className="w-4 h-4" />,
  'Medical Gas': <CloudFog className="w-4 h-4" />,
};

export function PlumbingSystemPanel({ systems }: Props) {
  const hasFaults = systems.some(s => s.status !== 'OK');

  return (
    <Card className={cn("shadow-glass h-full flex flex-col", hasFaults ? "border-emergency/30" : "border-white/[0.06]")}>
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-cyan-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-cyan-400 uppercase">Fluid Systems</h3>
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
           {systems.map(sys => {
             const isFaulty = sys.status === 'Fault';
             const isWarn = sys.status === 'Warning';
             return (
               <div key={sys.id} className={cn("p-4 flex flex-col gap-3", isFaulty ? "bg-emergency/[0.03]" : isWarn ? "bg-warning/[0.03]" : "")}>
                 <div className="flex justify-between items-start">
                   <div className="flex items-center gap-3">
                     <div className={cn("p-2 rounded border", isFaulty ? "bg-emergency/10 border-emergency/30 text-emergency-light" : isWarn ? "bg-warning/10 border-warning/30 text-warning-light" : "bg-white/5 border-white/10 text-cyan-300")}>
                       {typeIcon[sys.type]}
                     </div>
                     <div>
                       <h4 className="text-[12px] font-bold text-white">{sys.name}</h4>
                       <p className="text-[10px] text-gray-500 font-mono mt-0.5">{sys.location}</p>
                     </div>
                   </div>
                   {isFaulty && <AlertTriangle className="w-4 h-4 text-emergency-light animate-pulse" />}
                 </div>

                 {sys.pressureReading && (
                   <div className="mt-1">
                     <div className="flex items-center gap-2 text-[11px] font-mono">
                       <span className="text-gray-500">Pressure/Level:</span>
                       <span className={cn("font-bold", isWarn ? "text-warning-light" : "text-cyan-300")}>{sys.pressureReading}</span>
                     </div>
                   </div>
                 )}
               </div>
             );
           })}
        </div>
      </CardBody>
    </Card>
  );
}
