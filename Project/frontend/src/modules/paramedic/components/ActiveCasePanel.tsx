'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ActiveCase } from '../types/paramedic.types';
import { User, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activeCase: ActiveCase | null; }

export function ActiveCasePanel({ activeCase }: Props) {
  if (!activeCase) {
    return (
      <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col items-center justify-center p-6 text-center">
        <User className="w-12 h-12 text-gray-600 mb-3" />
        <p className="text-gray-400 font-bold">No active patient</p>
      </Card>
    );
  }

  return (
    <Card className={cn('shadow-glass h-full flex flex-col border-2 relative overflow-hidden',
      activeCase.triageLevel === 'Critical' ? 'border-emergency bg-emergency/[0.05]' : 'border-warning bg-warning/[0.05]'
    )}>
      {activeCase.triageLevel === 'Critical' && (
         <div className="absolute top-0 left-0 w-full h-1 bg-emergency-light animate-pulse" />
      )}

      <CardHeader className="border-b border-white/[0.04] p-4 bg-black/20">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ID: {activeCase.id}</span>
          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1',
            activeCase.triageLevel === 'Critical' ? 'bg-emergency/20 text-emergency-light' : 'bg-warning/20 text-warning-light'
          )}>
            {activeCase.triageLevel === 'Critical' && <AlertTriangle className="w-3 h-3" />}
            {activeCase.triageLevel} Triage
          </span>
        </div>
        <h3 className="text-[20px] font-black text-white leading-tight mb-1">{activeCase.patientName}</h3>
        <p className="text-[12px] text-gray-400">{activeCase.age}y • {activeCase.gender}</p>
      </CardHeader>

      <CardBody className="p-4 flex-1 flex flex-col gap-4">
        <div className="bg-black/30 border border-white/10 rounded-xl p-4">
          <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Chief Complaint / Mechanism</p>
          <p className="text-[14px] font-bold text-white">{activeCase.complaint}</p>
        </div>

        <div className="bg-black/30 border border-white/10 rounded-xl p-4 mt-auto">
           <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-gray-400 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Transport Duration</span>
              <span className="text-[18px] font-black font-mono text-white">{activeCase.timeEnRoute}</span>
           </div>
        </div>
      </CardBody>
    </Card>
  );
}
