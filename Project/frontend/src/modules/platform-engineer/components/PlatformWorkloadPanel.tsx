'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { K8sWorkload } from '../types/platform.types';
import { Layers, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { workloads: K8sWorkload[]; }

export function PlatformWorkloadPanel({ workloads }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/15"><Layers className="w-4 h-4 text-teal-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Workload Orchestration</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.03]">
          {workloads.map(wl => (
            <div key={wl.id} className={cn("p-5 transition-colors", wl.status === 'CrashLoopBackOff' ? "bg-emergency/5 border-l-2 border-emergency" : "hover:bg-white/[0.015]")}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[13px] font-bold text-white flex items-center gap-2">
                    {wl.name}
                    {wl.status === 'CrashLoopBackOff' && <ShieldAlert className="w-4 h-4 text-emergency-light animate-pulse" />}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded">{wl.type}</span>
                    <span className="text-[10px] font-mono text-gray-500">NS: {wl.namespace}</span>
                  </div>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  wl.status === 'Running' ? 'bg-success/20 text-success-light' : 
                  wl.status === 'Scaling' ? 'bg-blue-500/20 text-blue-400' : 'bg-emergency/20 text-emergency-light animate-pulse'
                )}>
                  {wl.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 border-t border-white/[0.04] pt-3">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-500">Pods (Ready/Desired)</span>
                  <span className="font-mono font-bold text-white"><span className={wl.pods.ready < wl.pods.desired ? "text-emergency-light" : "text-teal-400"}>{wl.pods.ready}</span> / {wl.pods.desired}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-500">Restarts</span>
                  <span className={cn("font-mono font-bold", wl.pods.restarts > 5 ? "text-emergency-light" : "text-white")}>{wl.pods.restarts}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
