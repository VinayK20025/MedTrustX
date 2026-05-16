'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { SystemHealth, SystemStatus } from '../types/it.types';
import { Server, Activity, AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { systems: SystemHealth[]; }

const statusColor: Record<SystemStatus, string> = {
  Operational: 'bg-emerald-500/20 text-emerald-400',
  Degraded: 'bg-warning/20 text-warning-light',
  Down: 'bg-emergency/20 text-emergency-light border border-emergency/30 animate-pulse',
  Maintenance: 'bg-blue-500/20 text-blue-300',
};

export function ItSystemPanel({ systems }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center gap-2">
        <div className="p-1.5 rounded bg-blue-500/15"><Activity className="w-4 h-4 text-blue-400" /></div>
        <h3 className="text-[14px] font-bold text-white tracking-wide">Core Systems Status</h3>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {systems.map(sys => (
            <div key={sys.id} className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[13px] font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                    {sys.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">{sys.type}</p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', statusColor[sys.status])}>{sys.status}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-black/20 rounded p-1.5 border border-white/5">
                  <div className="text-[9px] text-gray-500 uppercase">Uptime</div>
                  <div className={cn("text-[11px] font-mono font-bold", sys.uptimePercent < 99 ? "text-warning-light" : "text-emerald-400")}>{sys.uptimePercent}%</div>
                </div>
                <div className="bg-black/20 rounded p-1.5 border border-white/5">
                  <div className="text-[9px] text-gray-500 uppercase">Active Users</div>
                  <div className="text-[11px] font-mono font-bold text-blue-300">{sys.activeUsers}</div>
                </div>
              </div>
              
              {sys.status !== 'Operational' && (
                <div className="mt-3 flex items-center justify-between">
                   <span className="text-[10px] text-warning-light flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Diagnostics required</span>
                   <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
