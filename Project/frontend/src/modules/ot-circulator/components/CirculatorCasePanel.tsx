'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { CirculatorCase } from '../types/circulator.types';
import { Activity, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activeCase?: CirculatorCase; }

export function CirculatorCasePanel({ activeCase }: Props) {
  if (!activeCase) return <div className="p-10 text-center text-gray-500 border border-white/5 rounded-xl bg-surface-light font-mono text-[12px]">No active surgery being coordinated.</div>;

  return (
    <Card className="border-blue-500/30 shadow-glass bg-surface-dark h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 animate-pulse" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between bg-surface-light">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/15"><Activity className="w-4 h-4 text-blue-400" /></div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">Active Coordination</h3>
            <p className="text-[11px] text-blue-300 font-mono mt-0.5">{activeCase.id} | Phase: {activeCase.status}</p>
          </div>
        </div>
        <div className="text-right flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] text-gray-500"><Clock className="w-3 h-3"/> Started: {new Date(activeCase.startTime).toLocaleTimeString()}</span>
        </div>
      </CardHeader>

      <CardBody className="p-5 flex-1 overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-black text-white">{activeCase.procedure}</h2>
            <p className="text-[13px] text-gray-400 mt-1">Patient: <span className="text-white font-bold">{activeCase.patientName}</span></p>
          </div>
          <span className="bg-blue-500 text-white text-[12px] font-bold px-3 py-1 rounded animate-pulse">{activeCase.otRoom} LIVE</span>
        </div>

        <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
           <div className="bg-surface-light border border-white/5 p-3 rounded-lg text-center">
             <span className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Surgeon</span>
             <span className="text-[12px] font-bold text-white">{activeCase.surgeon}</span>
           </div>
           <div className="bg-surface-light border border-white/5 p-3 rounded-lg text-center">
             <span className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Anesthesia</span>
             <span className="text-[12px] font-bold text-white">{activeCase.anesthesiologist}</span>
           </div>
           <div className="bg-surface-light border border-white/5 p-3 rounded-lg text-center">
             <span className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Scrub Nurse</span>
             <span className="text-[12px] font-bold text-white">{activeCase.scrubNurse}</span>
           </div>
        </div>
      </CardBody>
    </Card>
  );
}
