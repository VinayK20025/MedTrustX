'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { DeviceTelemetryData, BiomedicalDevice } from '../types/biomedical.types';
import { Activity } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { telemetry: DeviceTelemetryData[]; devices: BiomedicalDevice[]; }

export function BiomedicalMonitoringPanel({ telemetry, devices }: Props) {
  return (
    <Card className="border-indigo-500/30 shadow-glass bg-[#0a0a0a] h-full flex flex-col font-mono relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 animate-pulse" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-gray-400">FLEET TELEMETRY NODE</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold tracking-wider">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          NETWORK SYNC
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
                    <p className="text-[9px] text-gray-500 mt-1">{device?.department} | {device?.location}</p>
                  </div>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded", tel.status === 'Nominal' ? 'bg-success/20 text-success-light' : 'bg-emergency/20 text-emergency-light animate-pulse')}>
                    {tel.status}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-gray-500">Error Codes</span>
                    {tel.errorCodes.length > 0 ? (
                      <span className="text-emergency-light">{tel.errorCodes.join(', ')}</span>
                    ) : (
                      <span className="text-success-light">NONE</span>
                    )}
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-gray-500">Last Ping</span>
                    <span className="text-indigo-400">{new Date(tel.lastPing).toLocaleTimeString()}</span>
                  </div>
                  {tel.batteryLevel !== undefined && (
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-gray-500">Battery Status</span>
                      <span className={tel.batteryLevel < 20 ? 'text-emergency-light' : 'text-teal-400'}>{tel.batteryLevel}%</span>
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
