'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { LabDeviceStatus } from '../types/labTech.types';
import { useLoadDevice } from '../hooks/useLabTechAnalytics';
import { MonitorPlay, Play } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { devices: LabDeviceStatus[]; }

export function LabTechExecutionPanel({ devices }: Props) {
  const { mutate: loadDevice, isPending } = useLoadDevice();

  return (
    <Card className="border-indigo-500/30 shadow-glass bg-[#0a0a0a] h-full flex flex-col font-mono relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 animate-pulse" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MonitorPlay className="w-4 h-4 text-indigo-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-gray-400">HARDWARE INTERFACE</h3>
        </div>
      </CardHeader>

      <CardBody className="p-4 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {devices.map(dev => (
            <div key={dev.id} className="border border-white/10 bg-[#111] rounded-xl p-4">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-[13px] font-bold text-white">{dev.name}</h4>
                <div className={cn("px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold", 
                  dev.status === 'Running' ? 'bg-success/20 text-success-light' : 
                  dev.status === 'Idle' ? 'bg-gray-500/20 text-gray-400' : 'bg-emergency/20 text-emergency-light'
                )}>
                  {dev.status}
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>Batch Capacity</span>
                  <span className="text-white">{dev.currentBatchSize} / {dev.maxBatchSize}</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className={cn("h-full transition-all duration-1000", dev.status === 'Running' ? "bg-success" : "bg-indigo-500")} 
                       style={{ width: `${(dev.currentBatchSize / dev.maxBatchSize) * 100}%` }} />
                </div>
                
                {dev.timeRemainingMinutes !== undefined && (
                  <div className="text-[11px] text-success-light flex justify-between">
                    <span>Est. Completion:</span>
                    <span>{dev.timeRemainingMinutes}m</span>
                  </div>
                )}
              </div>

              {dev.status === 'Idle' && (
                <Button size="sm" onClick={() => loadDevice(dev.id)} disabled={isPending} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold border-none" leftIcon={<Play className="w-3.5 h-3.5" />}>
                  Start Run
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
