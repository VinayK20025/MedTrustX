'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { BiomedDevice } from '../types/biomedTech.types';
import { Database, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { devices: BiomedDevice[]; }

export function BiomedTechDevicePanel({ devices }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/15"><Database className="w-4 h-4 text-teal-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Device Status (Local)</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        <div className="divide-y divide-white/[0.03]">
          {devices.map(dev => (
            <div key={dev.id} className={cn("p-5 transition-colors", dev.status === 'Fault' ? "bg-emergency/5 border-l-2 border-emergency" : "hover:bg-white/[0.015]")}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[13px] font-bold text-white flex items-center gap-2">
                    {dev.name}
                    {dev.status === 'Fault' && <ShieldAlert className="w-4 h-4 text-emergency-light animate-pulse" />}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-1">{dev.id}</p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  dev.status === 'Online' ? 'bg-success/20 text-success-light' : 
                  dev.status === 'Offline' ? 'bg-gray-500/20 text-gray-400' :
                  dev.status === 'Maintenance' ? 'bg-blue-500/20 text-blue-400' : 'bg-emergency/20 text-emergency-light'
                )}>
                  {dev.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
