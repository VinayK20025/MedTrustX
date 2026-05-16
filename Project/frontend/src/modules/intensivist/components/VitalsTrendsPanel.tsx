'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ActivePatientDetails } from '../types/intensivist.types';
import { LineChart, Activity, Droplet } from 'lucide-react';

interface Props { details: ActivePatientDetails | null; }

export function VitalsTrendsPanel({ details: d }: Props) {
  if (!d) return null;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <LineChart className="w-5 h-5 text-teal-400" />
        <h3 className="text-lg font-semibold text-white tracking-wide">Trends & Labs</h3>
      </CardHeader>
      <CardBody className="p-4 flex-1 overflow-y-auto space-y-6">
        
        {/* Simplified Vitals Grid - Shows latest vs previous */}
        <div>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Activity className="w-3 h-3"/> Vitals Trend (Last 4 hours)</h4>
          <div className="flex gap-2 overflow-x-auto pb-2">
             {d.vitalsHistory.map((v, i) => {
               const isLatest = i === d.vitalsHistory.length - 1;
               return (
                 <div key={i} className={`min-w-[120px] p-2 rounded border ${isLatest ? 'border-emergency/30 bg-emergency/5' : 'border-white/[0.04] bg-white/[0.02]'}`}>
                   <p className="text-[9px] text-gray-500 mb-1">{v.timestamp}</p>
                   <p className={`text-xs font-mono font-bold ${v.bpSys < 90 ? 'text-emergency-light' : 'text-gray-300'}`}>BP: {v.bpSys}/{v.bpDia}</p>
                   <p className={`text-xs font-mono ${v.hr > 110 ? 'text-warning-light' : 'text-gray-400'}`}>HR: {v.hr}</p>
                 </div>
               )
             })}
          </div>
        </div>

        {/* Labs */}
        <div>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Droplet className="w-3 h-3"/> Key Diagnostics</h4>
          <div className="grid grid-cols-2 gap-3">
             {d.labs.map(l => (
               <div key={l.id} className={`p-2 rounded border flex justify-between items-center ${l.status === 'critical' ? 'border-emergency/30 bg-emergency/10 text-emergency-light' : 'border-white/[0.06] bg-white/[0.02] text-gray-300'}`}>
                 <div>
                   <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">{l.testName}</p>
                   <p className="text-sm font-black font-mono mt-0.5">{l.value} <span className="text-[9px] font-normal opacity-70">{l.unit}</span></p>
                 </div>
                 <div className="text-right">
                   <p className="text-[12px] font-bold">{l.trend === 'up' ? '↑' : l.trend === 'down' ? '↓' : '→'}</p>
                   <p className="text-[8px] opacity-60">{l.time}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>

      </CardBody>
    </Card>
  );
}
