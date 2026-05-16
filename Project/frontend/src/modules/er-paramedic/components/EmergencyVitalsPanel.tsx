'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { EmergencyVitals, EmergencyLog } from '../types/er-paramedic.types';
import { MonitorHeart, Terminal } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { vitals: EmergencyVitals | null; logs: EmergencyLog[]; }

export function EmergencyVitalsPanel({ vitals, logs }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col relative">
      <CardHeader className="border-b border-white/[0.04] p-4 flex justify-between items-center bg-black/30">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <MonitorHeart className="w-4 h-4 text-cyan-400" /> Defib Monitor
        </h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 flex flex-col">
        {/* Vitals Readout */}
        {vitals && (
          <div className="p-5 border-b border-white/10 bg-black/60">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Heart Rate</p>
                <p className="text-4xl font-black font-mono text-red-500 animate-pulse">{vitals.hr}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">SpO2</p>
                <p className="text-4xl font-black font-mono text-gray-600">{vitals.spo2}%</p>
              </div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg flex justify-between items-center">
               <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Analyzed Rhythm</span>
               <span className={cn('text-[18px] font-black', vitals.rhythm === 'VFib' ? 'text-emergency-light animate-pulse' : 'text-white')}>{vitals.rhythm}</span>
            </div>
          </div>
        )}

        {/* Real-time Code Log */}
        <div className="flex-1 overflow-y-auto bg-[#020202] p-4 flex flex-col">
           <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> Event Log</h4>
           <div className="space-y-3 flex-1">
             {logs.map(log => (
               <div key={log.id} className="flex gap-3">
                 <span className="text-[11px] font-mono text-cyan-500 shrink-0">{new Date(log.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span>
                 <span className="text-[12px] font-bold text-gray-300">{log.action}</span>
               </div>
             ))}
           </div>
        </div>

      </CardBody>
    </Card>
  );
}
