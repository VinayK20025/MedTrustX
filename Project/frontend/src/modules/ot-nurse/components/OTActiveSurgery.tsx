'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { OTSurgeryCase } from '../types/ot.types';
import { Activity, Clock } from 'lucide-react';

interface Props { activeCase: OTSurgeryCase | null; }

export function OTActiveSurgery({ activeCase }: Props) {
  if (!activeCase) {
    return (
      <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex items-center justify-center">
        <p className="text-gray-400">No active surgery</p>
      </Card>
    );
  }

  return (
    <Card className="border-teal-500/20 shadow-glass bg-surface-light h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-teal-500" />
      <CardHeader className="border-b border-teal-500/10 px-5 py-4 flex items-center justify-between bg-teal-500/5">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">Active Procedure</h3>
        </div>
        <span className="text-xs font-mono bg-teal-500/20 text-teal-300 px-3 py-1 rounded-lg border border-teal-500/30">
          {activeCase.room}
        </span>
      </CardHeader>
      <CardBody className="p-5 flex-1 flex flex-col gap-4">
        <div>
           <h2 className="text-2xl font-black text-white">{activeCase.patientName}</h2>
           <p className="text-sm font-mono text-gray-400 mt-1 uppercase tracking-widest">{activeCase.procedure}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-2">
           <div className="p-3 rounded-lg border border-white/[0.04] bg-surface-dark">
             <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Lead Surgeon</span>
             <span className="text-sm font-bold text-white">{activeCase.surgeon}</span>
           </div>
           <div className="p-3 rounded-lg border border-white/[0.04] bg-surface-dark">
             <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Start Time</span>
             <span className="text-sm font-bold text-white flex items-center gap-2">
               <Clock className="w-4 h-4 text-teal-400" /> {activeCase.startTime}
             </span>
           </div>
        </div>
      </CardBody>
    </Card>
  );
}
