'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ImagingDeviceStatus } from '../types/radiologyTech.types';
import { Server, Thermometer } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { devices: ImagingDeviceStatus[]; }

export function RadiologyTechDevicePanel({ devices }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/15"><Server className="w-4 h-4 text-blue-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Scanner Telemetry</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        <div className="divide-y divide-white/[0.03]">
          {devices.map(dev => (
            <div key={dev.id} className="p-4 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[13px] font-bold text-white flex items-center gap-2">{dev.name}</h4>
                  <span className="text-[10px] text-gray-500 bg-surface-dark px-1.5 py-0.5 rounded font-mono mt-1 inline-block">{dev.modality}</span>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  dev.status === 'Ready' ? 'bg-success/20 text-success-light' : 
                  dev.status === 'Scanning' ? 'bg-blue-500/20 text-blue-400 animate-pulse' : 'bg-warning/20 text-warning-light'
                )}>
                  {dev.status}
                </span>
              </div>
              
              <div className="mt-4 space-y-2">
                {dev.tubeHeatPercentage !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                      <span>Tube Heat</span>
                      <span className={cn(dev.tubeHeatPercentage > 80 ? "text-emergency-light" : "text-white")}>{dev.tubeHeatPercentage}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className={cn("h-full transition-all duration-1000", dev.tubeHeatPercentage > 80 ? "bg-emergency" : dev.tubeHeatPercentage > 60 ? "bg-warning" : "bg-success")} style={{ width: `${dev.tubeHeatPercentage}%` }} />
                    </div>
                  </div>
                )}
                {dev.temperature !== undefined && (
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1"><Thermometer className="w-3 h-3"/> Core Temp</span>
                    <span className="text-white">{dev.temperature}°C</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
