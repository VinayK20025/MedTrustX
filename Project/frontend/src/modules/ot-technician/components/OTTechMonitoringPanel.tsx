'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { DeviceTelemetry, OTDevice } from '../types/otTech.types';
import { Activity } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { telemetry: DeviceTelemetry[]; devices: OTDevice[]; }

export function OTTechMonitoringPanel({ telemetry, devices }: Props) {
  return (
    <Card className="border-blue-500/30 shadow-glass bg-black h-full flex flex-col font-mono relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 animate-pulse" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-gray-400">LIVE HARDWARE TELEMETRY</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-bold tracking-wider">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          POLLING (5s)
        </div>
      </CardHeader>

      <CardBody className="p-4 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {telemetry.map(tel => {
            const device = devices.find(d => d.id === tel.deviceId);
            return (
              <div key={tel.deviceId} className="bg-[#111] p-4 rounded-lg border border-white/10">
                <div className="flex justify-between items-start border-b border-white/5 pb-2 mb-3">
                  <div>
                    <h4 className="text-[12px] font-bold text-white">{device?.name || tel.deviceId}</h4>
                    <p className="text-[9px] text-gray-500">{device?.otRoom}</p>
                  </div>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded", tel.status === 'Nominal' ? 'bg-success/20 text-success-light' : 'bg-emergency/20 text-emergency-light animate-pulse')}>
                    {tel.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {tel.temperature && (
                    <div className="bg-black p-2 rounded">
                      <span className="text-gray-500 block">TEMP (°C)</span>
                      <span className="text-[14px] text-orange-400">{tel.temperature}</span>
                    </div>
                  )}
                  {tel.pressure && (
                    <div className="bg-black p-2 rounded">
                      <span className="text-gray-500 block">PRESSURE (PSI)</span>
                      <span className="text-[14px] text-teal-400">{tel.pressure}</span>
                    </div>
                  )}
                  {tel.voltage && (
                    <div className="bg-black p-2 rounded">
                      <span className="text-gray-500 block">VOLTAGE (V)</span>
                      <span className="text-[14px] text-yellow-400">{tel.voltage}</span>
                    </div>
                  )}
                  {tel.flowRate && (
                    <div className="bg-black p-2 rounded">
                      <span className="text-gray-500 block">FLOW (L/min)</span>
                      <span className="text-[14px] text-blue-400">{tel.flowRate}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
