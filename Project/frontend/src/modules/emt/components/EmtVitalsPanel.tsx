'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { EmtVitals } from '../types/emt.types';
import { HeartPulse, AlertCircle, Activity } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { vitals: EmtVitals | null; }

export function EmtVitalsPanel({ vitals }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col relative">
      <CardHeader className="border-b border-white/[0.04] p-4 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-emerald-400" /> Live Telemetry
        </h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 flex flex-col">
        {/* Vitals Readout */}
        {vitals ? (
          <div className={cn('p-5 border-b flex-1', vitals.isAbnormal ? 'bg-emergency/10 border-emergency/30' : 'bg-black/30 border-white/10')}>
            {vitals.isAbnormal && (
              <div className="flex items-center gap-2 mb-4 text-emergency-light font-bold text-[11px] uppercase tracking-wider animate-pulse">
                <AlertCircle className="w-4 h-4" /> Abnormal Vitals Alert
              </div>
            )}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Heart Rate</p>
                <p className={cn('text-5xl font-black font-mono', vitals.hr > 100 || vitals.hr < 60 ? 'text-emergency-light' : 'text-white')}>{vitals.hr} <span className="text-xl text-gray-500 font-sans">bpm</span></p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Blood Pressure</p>
                <p className="text-4xl font-black font-mono text-white">{vitals.bp}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> SpO2</p>
                <p className={cn('text-4xl font-black font-mono', vitals.spo2 < 94 ? 'text-emergency-light' : 'text-emerald-400')}>{vitals.spo2}<span className="text-xl">%</span></p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Resp Rate</p>
                <p className={cn('text-4xl font-black font-mono', vitals.respRate > 20 || vitals.respRate < 12 ? 'text-emergency-light' : 'text-white')}>{vitals.respRate}</p>
              </div>
            </div>
          </div>
        ) : (
           <div className="flex-1 flex items-center justify-center p-6 text-center opacity-40">
             <div>
                <HeartPulse className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Connect monitors to sync vitals</p>
             </div>
           </div>
        )}

      </CardBody>
    </Card>
  );
}
