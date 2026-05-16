'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { AnesthesiaMachine } from '../types/anesthesiaTech.types';
import { Wind, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { machines: AnesthesiaMachine[]; }

export function AnesthesiaDevicePanel({ machines }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/15"><Wind className="w-4 h-4 text-teal-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Anesthesia Machines</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.03]">
          {machines.map(mac => (
            <div key={mac.id} className={cn("p-5 transition-colors", mac.status === 'Checkout Required' ? "bg-warning/5 border-l-2 border-warning" : "hover:bg-white/[0.015]")}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                    {mac.model} ({mac.id})
                    {mac.status === 'Checkout Required' && <ShieldAlert className="w-4 h-4 text-warning-light animate-pulse" />}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-mono mt-1">Room: {mac.otRoom}</p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  mac.status === 'Ready' ? 'bg-success/20 text-success-light' : 
                  mac.status === 'In Use' ? 'bg-blue-500/20 text-blue-400' :
                  mac.status === 'Checkout Required' ? 'bg-warning/20 text-warning-light' : 'bg-emergency/20 text-emergency-light'
                )}>
                  {mac.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-gray-400">O2 Reserve</span>
                    <span className={mac.gasLevels.O2 < 25 ? 'text-emergency-light' : 'text-teal-400'}>{mac.gasLevels.O2}%</span>
                  </div>
                  <div className="w-full bg-surface-dark h-1.5 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", mac.gasLevels.O2 < 25 ? 'bg-emergency-light' : 'bg-teal-400')} style={{ width: `${mac.gasLevels.O2}%` }} />
                  </div>

                  <div className="flex justify-between text-[10px] font-bold mt-2">
                    <span className="text-gray-400">Air</span>
                    <span className="text-blue-400">{mac.gasLevels.Air}%</span>
                  </div>
                  <div className="w-full bg-surface-dark h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-400" style={{ width: `${mac.gasLevels.Air}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-gray-400">CO2 Absorber</span>
                    <span className={mac.absorberStatus < 10 ? 'text-emergency-light' : 'text-purple-400'}>{mac.absorberStatus}% life</span>
                  </div>
                  <div className="w-full bg-surface-dark h-1.5 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", mac.absorberStatus < 10 ? 'bg-emergency-light' : 'bg-purple-400')} style={{ width: `${mac.absorberStatus}%` }} />
                  </div>
                  
                  <div className="flex justify-between text-[10px] font-bold mt-2">
                    <span className="text-gray-400">Vaporizer</span>
                    <span className="text-yellow-400">{mac.vaporizerLevel}%</span>
                  </div>
                  <div className="w-full bg-surface-dark h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-yellow-400" style={{ width: `${mac.vaporizerLevel}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
