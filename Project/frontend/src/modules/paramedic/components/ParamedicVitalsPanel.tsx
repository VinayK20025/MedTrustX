'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ParamedicVitals } from '../types/paramedic.types';
import { useRecordVitals, useNotifyER } from '../hooks/useParamedicAnalytics';
import { HeartPulse, Radio, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { vitalsHistory: ParamedicVitals[]; }

export function ParamedicVitalsPanel({ vitalsHistory }: Props) {
  const { mutate: notifyER } = useNotifyER();
  const latestVitals = vitalsHistory[0];

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col relative">
      <CardHeader className="border-b border-white/[0.04] p-4 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-emerald-400" /> Live Vitals (Monitor)
        </h3>
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-success-light bg-success/10 px-2 py-0.5 rounded border border-success/20 animate-pulse">
           <Radio className="w-3 h-3" /> Syncing to ER
        </span>
      </CardHeader>

      <CardBody className="p-0 flex-1 flex flex-col">
        {/* Latest Vitals Readout (Big) */}
        {latestVitals && (
          <div className={cn('p-5 border-b', latestVitals.isAbnormal ? 'bg-emergency/10 border-emergency/30' : 'bg-black/30 border-white/10')}>
            {latestVitals.isAbnormal && (
              <div className="flex items-center gap-2 mb-3 text-emergency-light font-bold text-[11px] uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5" /> Abnormal Reading Detected
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">BP</p>
                <p className={cn('text-3xl font-black font-mono', latestVitals.isAbnormal ? 'text-emergency-light' : 'text-white')}>{latestVitals.bp}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">HR</p>
                <p className={cn('text-3xl font-black font-mono', latestVitals.isAbnormal ? 'text-emergency-light' : 'text-white')}>{latestVitals.hr}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">SpO2</p>
                <p className={cn('text-3xl font-black font-mono', latestVitals.spo2 < 94 ? 'text-emergency-light' : 'text-emerald-400')}>{latestVitals.spo2}%</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Temp</p>
                <p className="text-3xl font-black font-mono text-white">{latestVitals.temp}</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 mt-auto">
          <Button onClick={() => notifyER()} className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black text-[14px] shadow-[0_0_20px_rgba(220,38,38,0.3)] border border-red-500">
             ACTIVATE ER TRAUMA TEAM
          </Button>
          <p className="text-[10px] text-center text-gray-500 mt-3">Pressing this instantly alerts the receiving hospital to assemble the trauma code team prior to arrival.</p>
        </div>
      </CardBody>
    </Card>
  );
}
