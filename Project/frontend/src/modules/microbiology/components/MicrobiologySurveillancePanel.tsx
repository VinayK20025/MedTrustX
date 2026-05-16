'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { InfectionSurveillance } from '../types/microbiology.types';
import { Radar, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { surveillance: InfectionSurveillance[]; }

export function MicrobiologySurveillancePanel({ surveillance }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-500/15"><Radar className="w-4 h-4 text-orange-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Infection Surveillance</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        <div className="divide-y divide-white/[0.03]">
          {surveillance.map((surv, idx) => (
            <div key={idx} className={cn("p-5 hover:bg-white/[0.015] transition-colors", surv.outbreakStatus === 'Outbreak Alert' ? 'border-l-2 border-emergency bg-emergency/5' : '')}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-[13px] font-bold text-white flex items-center gap-2">
                  {surv.wardName}
                </h4>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  surv.outbreakStatus === 'Outbreak Alert' ? 'bg-emergency/20 text-emergency-light' : 
                  surv.outbreakStatus === 'Monitoring' ? 'bg-warning/20 text-warning-light' : 'bg-success/20 text-success-light'
                )}>
                  {surv.outbreakStatus}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-[10px] text-gray-400 bg-surface-dark p-2 rounded-lg mb-2">
                <span>Dominant: <span className="font-bold italic text-white">{surv.dominantOrganism}</span></span>
                <span className="flex items-center gap-1 text-orange-400 font-bold"><TrendingUp className="w-3 h-3"/> {surv.activeCases} Active</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
