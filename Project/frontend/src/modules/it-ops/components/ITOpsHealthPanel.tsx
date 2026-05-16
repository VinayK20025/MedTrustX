'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ITOpsServiceHealth } from '../types/itOps.types';
import { Server, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { healthData: ITOpsServiceHealth[]; }

export function ITOpsHealthPanel({ healthData }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-indigo-400" />
          <h3 className="text-[15px] font-semibold text-white tracking-wide">System Health Overview</h3>
        </div>
      </CardHeader>
      <CardBody className="p-3 flex-1 overflow-y-auto space-y-2">
        {healthData.map(h => (
          <div key={h.id} className={`p-3 rounded-xl border flex items-center justify-between ${
            h.status === 'healthy' ? 'border-white/[0.06] bg-surface-dark' :
            h.status === 'degraded' ? 'border-warning/30 bg-warning/5' :
            'border-emergency/30 bg-emergency/10'
          }`}>
             <div className="flex items-center gap-3">
               <div className={`p-2 rounded-full ${
                 h.status === 'healthy' ? 'bg-success/20 text-success-light' :
                 h.status === 'degraded' ? 'bg-warning/20 text-warning-light' :
                 'bg-emergency/20 text-emergency-light'
               }`}>
                 {h.status === 'healthy' && <CheckCircle2 className="w-4 h-4" />}
                 {h.status === 'degraded' && <AlertTriangle className="w-4 h-4" />}
                 {h.status === 'down' && <XCircle className="w-4 h-4" />}
               </div>
               <div>
                 <span className="text-sm font-bold text-white block">{h.system}</span>
                 <span className="text-[11px] text-gray-400">Last Incident: {h.lastIncident}</span>
               </div>
             </div>
             
             <div className="flex items-center gap-4">
               <div className="text-right">
                 <span className="text-sm font-mono font-bold text-white block">{h.uptime}</span>
                 <span className="text-[10px] text-gray-500 uppercase tracking-widest">Uptime</span>
               </div>
               <Button size="sm" variant="outline" className="h-8 border-white/10 hover:bg-white/5">Metrics</Button>
             </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
