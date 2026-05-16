'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { CodeAlert } from '../types/er-paramedic.types';
import { Siren, MapPin, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { code: CodeAlert | null; }

export function EmergencyCasePanel({ code }: Props) {
  if (!code) {
    return (
      <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col items-center justify-center p-6 text-center">
        <Siren className="w-12 h-12 text-gray-600 mb-3 opacity-30" />
        <p className="text-gray-400 font-bold uppercase tracking-widest">No Active Codes</p>
      </Card>
    );
  }

  return (
    <Card className={cn('shadow-glass h-full flex flex-col border-2 relative overflow-hidden',
      code.codeType === 'Code Blue' ? 'border-red-600 bg-red-600/[0.08]' : 'border-orange-500 bg-orange-500/[0.08]'
    )}>
      <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600 animate-pulse" />

      <CardHeader className="border-b border-red-600/20 p-5 bg-black/40">
        <div className="flex justify-between items-start mb-3">
          <span className="text-[12px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
            <Siren className="w-4 h-4 animate-pulse" /> {code.codeType}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-red-600/20 text-red-300">
            {code.status}
          </span>
        </div>
        <h3 className="text-[24px] font-black text-white leading-tight mb-2 uppercase">{code.location}</h3>
      </CardHeader>

      <CardBody className="p-5 flex-1 flex flex-col gap-4">
        <div className="bg-black/50 border border-red-500/20 rounded-xl p-4">
          <p className="text-[10px] uppercase font-bold text-red-400/70 tracking-wider mb-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Patient Info</p>
          <p className="text-[16px] font-bold text-white">{code.patientName}</p>
        </div>

        <div className="bg-black/50 border border-red-500/20 rounded-xl p-4 mt-auto">
           <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-red-400/70 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Code Duration</span>
              <span className="text-[24px] font-black font-mono text-white">
                 {/* Mock timer logic */}
                 02:15
              </span>
           </div>
        </div>
      </CardBody>
    </Card>
  );
}
