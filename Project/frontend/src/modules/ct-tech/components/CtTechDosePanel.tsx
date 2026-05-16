'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { RadiationDoseRecord } from '../types/ctTech.types';
import { RadioTower, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { records: RadiationDoseRecord[]; }

export function CtTechDosePanel({ records }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/15"><RadioTower className="w-4 h-4 text-teal-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Radiation Dose Monitoring</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        <div className="p-4 bg-white/[0.02] border-b border-white/5">
           <p className="text-[11px] text-gray-400 mb-1 leading-relaxed font-mono">DLP: Dose Length Product (mGy*cm) | CTDIvol: Volumetric Computed Tomography Dose Index (mGy)</p>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {records.map(rec => (
            <div key={rec.id} className={cn("p-4 transition-colors", rec.isOverLimit ? "bg-emergency/10" : "hover:bg-white/[0.015]")}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[13px] font-bold text-white flex items-center gap-2">
                    Study: {rec.studyId}
                    {rec.isOverLimit && <AlertTriangle className="w-3.5 h-3.5 text-emergency-light animate-pulse" />}
                  </h4>
                  <span className="text-[10px] text-gray-500 bg-surface-dark px-1.5 py-0.5 rounded font-mono mt-1 inline-block">PT: {rec.patientId}</span>
                </div>
                <div className="text-right">
                  <span className={cn('text-[14px] font-black block font-mono', rec.isOverLimit ? 'text-emergency-light' : 'text-teal-400')}>
                    {rec.effectiveDoseMSv} mSv
                  </span>
                  <span className="text-[9px] text-gray-500">Limit: {rec.thresholdLimit}</span>
                </div>
              </div>
              
              <div className="mt-4 flex gap-4 text-[10px] font-mono text-gray-400">
                <span>CTDIvol: <span className="text-white">{rec.ctdiVol}</span></span>
                <span>DLP: <span className="text-white">{rec.dlp}</span></span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
