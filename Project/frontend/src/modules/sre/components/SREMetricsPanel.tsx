'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { SREMetric, SREService } from '../types/sre.types';
import { Activity } from 'lucide-react';

interface Props { 
  metrics: SREMetric[];
  services: SREService[];
}

export function SREMetricsPanel({ metrics, services }: Props) {
  const getServiceName = (id: string) => services.find(s => s.id === id)?.name || id;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-400" />
          <h3 className="text-[15px] font-semibold text-white tracking-wide">Live Metrics</h3>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-4 overflow-y-auto">
         {metrics.map(m => (
           <div key={m.id} className="p-4 rounded-xl border border-white/[0.06] bg-surface-dark flex flex-col gap-4">
              <span className="text-sm font-bold text-white block">{getServiceName(m.serviceId)}</span>
              
              <div className="space-y-3">
                 <div>
                   <div className="flex justify-between text-[11px] mb-1">
                     <span className="text-gray-400">CPU Usage</span>
                     <span className={`font-mono font-bold ${m.cpu > 80 ? 'text-emergency-light' : 'text-success-light'}`}>{m.cpu}%</span>
                   </div>
                   <div className="w-full bg-white/5 rounded-full h-1.5">
                     <div className={`h-1.5 rounded-full ${m.cpu > 80 ? 'bg-emergency' : 'bg-success'}`} style={{ width: `${m.cpu}%` }}></div>
                   </div>
                 </div>

                 <div>
                   <div className="flex justify-between text-[11px] mb-1">
                     <span className="text-gray-400">Memory Usage</span>
                     <span className={`font-mono font-bold ${m.memory > 80 ? 'text-warning-light' : 'text-indigo-400'}`}>{m.memory}%</span>
                   </div>
                   <div className="w-full bg-white/5 rounded-full h-1.5">
                     <div className={`h-1.5 rounded-full ${m.memory > 80 ? 'bg-warning' : 'bg-indigo-500'}`} style={{ width: `${m.memory}%` }}></div>
                   </div>
                 </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-white/[0.04]">
                 <span className="text-[10px] text-gray-500 uppercase tracking-widest">Active Connections</span>
                 <span className="text-sm font-mono font-bold text-white">{m.activeConnections}</span>
              </div>
           </div>
         ))}
      </CardBody>
    </Card>
  );
}
