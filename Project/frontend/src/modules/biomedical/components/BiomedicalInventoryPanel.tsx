'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { BiomedicalDevice } from '../types/biomedical.types';
import { Database, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { devices: BiomedicalDevice[]; }

export function BiomedicalInventoryPanel({ devices }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/15"><Database className="w-4 h-4 text-indigo-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Fleet Inventory</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.03]">
          {devices.map(dev => (
            <div key={dev.id} className={cn("p-5 transition-colors", dev.status === 'Fault' ? "bg-emergency/5 border-l-2 border-emergency" : "hover:bg-white/[0.015]")}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                    {dev.name}
                    {dev.status === 'Fault' && <ShieldAlert className="w-4 h-4 text-emergency-light animate-pulse" />}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-500 font-mono bg-white/5 px-2 py-0.5 rounded">{dev.id}</span>
                    <span className="text-[10px] text-gray-500 font-mono">SN: {dev.serialNumber}</span>
                  </div>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  dev.status === 'Online' ? 'bg-success/20 text-success-light' : 
                  dev.status === 'Offline' ? 'bg-gray-500/20 text-gray-400' :
                  dev.status === 'Maintenance' ? 'bg-blue-500/20 text-blue-400' : 'bg-emergency/20 text-emergency-light'
                )}>
                  {dev.status}
                </span>
              </div>

              <div className="flex justify-between items-center mt-4 border-t border-white/[0.04] pt-3">
                <div className="flex gap-2">
                  <span className="text-[9px] uppercase font-bold text-gray-400 bg-surface-dark px-2 py-1 rounded border border-white/5">{dev.type}</span>
                  <span className="text-[9px] uppercase font-bold text-gray-400 bg-surface-dark px-2 py-1 rounded border border-white/5">{dev.department} ({dev.location})</span>
                </div>
                <span className={cn("text-[9px] uppercase font-bold px-2 py-1 rounded border", 
                  dev.riskLevel === 'Life-Critical' ? "border-emergency/30 text-emergency-light bg-emergency/10" : "border-white/10 text-gray-400"
                )}>
                  {dev.riskLevel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
