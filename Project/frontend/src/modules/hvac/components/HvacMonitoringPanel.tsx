'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { HVACSystem } from '../types/hvac.types';
import { Wind, Thermometer, Droplets, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { systems: HVACSystem[]; }

export function HvacMonitoringPanel({ systems }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-emerald-400 uppercase">Live Environments</h3>
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
                   <div>
                     <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                       {sys.name} 
                       {sys.criticalZone && <span className="bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold">Critical Zone</span>}
                     </h4>
                     <p className="text-[10px] text-gray-500 font-mono mt-0.5">{sys.location}</p>
                   </div>
                   {isFaulty && <AlertTriangle className="w-4 h-4 text-emergency-light animate-pulse" />}
                 </div>

                 {/* Real-time Sensor Data Grid */}
                 <div className="grid grid-cols-2 gap-2 mt-2">
                   <div className="bg-black/30 border border-white/5 rounded-lg p-2 flex items-center gap-2">
                     <Thermometer className="w-4 h-4 text-orange-400" />
                     <div>
                       <div className="text-[9px] text-gray-500 uppercase">Temp</div>
                       <div className="text-[12px] font-bold font-mono text-white">{sys.sensors.temperature.toFixed(1)}°C</div>
                     </div>
                   </div>
                   <div className="bg-black/30 border border-white/5 rounded-lg p-2 flex items-center gap-2">
                     <Droplets className="w-4 h-4 text-blue-400" />
                     <div>
                       <div className="text-[9px] text-gray-500 uppercase">Humidity</div>
                       <div className="text-[12px] font-bold font-mono text-white">{sys.sensors.humidity}%</div>
                     </div>
                   </div>
                   <div className={cn("bg-black/30 border rounded-lg p-2 flex items-center gap-2", sys.sensors.pressure.includes('Loss') ? "border-emergency/30" : "border-white/5")}>
                     <Wind className={cn("w-4 h-4", sys.sensors.pressure.includes('Loss') ? "text-emergency-light" : "text-teal-400")} />
                     <div>
                       <div className="text-[9px] text-gray-500 uppercase">Pressure</div>
                       <div className={cn("text-[11px] font-bold font-mono", sys.sensors.pressure.includes('Loss') ? "text-emergency-light" : "text-white")}>{sys.sensors.pressure}</div>
                     </div>
                   </div>
                   <div className="bg-black/30 border border-white/5 rounded-lg p-2 flex items-center gap-2">
                     <ShieldCheck className={cn("w-4 h-4", sys.sensors.airQuality === 'Poor' ? "text-warning-light" : sys.sensors.airQuality === 'Excellent' ? "text-success-light" : "text-gray-400")} />
                     <div>
                       <div className="text-[9px] text-gray-500 uppercase">Air Quality</div>
                       <div className="text-[11px] font-bold font-mono text-white">{sys.sensors.airQuality}</div>
                     </div>
                   </div>
                 </div>
               </div>
             );
           })}
        </div>
      </CardBody>
    </Card>
  );
}
