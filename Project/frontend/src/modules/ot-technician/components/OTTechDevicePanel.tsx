'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { OTDevice } from '../types/otTech.types';
import { Server, Settings, Power, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { devices: OTDevice[]; }

export function OTTechDevicePanel({ devices }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/15"><Server className="w-4 h-4 text-blue-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">OT Equipment Status</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.03]">
          {devices.map(dev => (
            <div key={dev.id} className="p-4 hover:bg-white/[0.015] transition-colors flex justify-between items-start">
              <div>
                <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                  {dev.name}
                  {dev.status === 'Active' && <div className="w-2 h-2 rounded-full bg-success-light animate-pulse" />}
                  {dev.status === 'Failed' && <ShieldAlert className="w-4 h-4 text-emergency-light animate-pulse" />}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">{dev.type}</span>
                  <span className="text-[10px] font-mono text-gray-500">Loc: {dev.otRoom}</span>
                </div>
                <div className="mt-3 text-[10px] text-gray-500 font-mono flex items-center gap-2">
                  <Settings className="w-3 h-3" /> Last Cal: {new Date(dev.lastCalibration).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  dev.status === 'Active' ? 'bg-success/20 text-success-light' : 
                  dev.status === 'Standby' ? 'bg-blue-500/20 text-blue-400' :
                  dev.status === 'Maintenance Due' ? 'bg-warning/20 text-warning-light' : 'bg-emergency/20 text-emergency-light'
                )}>
                  {dev.status}
                </span>
                {dev.batteryLevel !== undefined && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                    <Power className="w-3 h-3 text-success-light"/> {dev.batteryLevel}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
