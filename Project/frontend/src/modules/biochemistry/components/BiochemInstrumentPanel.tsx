'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { AnalyzerInstrument } from '../types/biochemistry.types';
import { useCalibrateInstrument } from '../hooks/useBiochemAnalytics';
import { Settings, Droplet } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { instruments: AnalyzerInstrument[]; }

export function BiochemInstrumentPanel({ instruments }: Props) {
  const { mutate: calibrate, isPending } = useCalibrateInstrument();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-500/15"><Settings className="w-4 h-4 text-orange-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Analyzer Instruments</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        <div className="divide-y divide-white/[0.03]">
          {instruments.map(inst => (
            <div key={inst.id} className={cn("p-5 hover:bg-white/[0.015] transition-colors", inst.status === 'Maintenance Required' ? 'border-l-2 border-emergency bg-emergency/5' : '')}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-[13px] font-bold text-white flex items-center gap-2">
                  {inst.name}
                </h4>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  inst.status === 'Operational' ? 'bg-success/20 text-success-light' : 
                  inst.status === 'Calibrating' ? 'bg-blue-500/20 text-blue-400' : 'bg-emergency/20 text-emergency-light'
                )}>
                  {inst.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-[10px] mt-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">Processed Today: <span className="text-white font-mono">{inst.samplesProcessedToday}</span></span>
                  <span className="flex items-center gap-1 text-gray-400"><Droplet className="w-3 h-3 text-blue-400"/> Reagents: <span className={cn("font-mono", inst.reagentLevels < 20 ? "text-emergency-light" : "text-white")}>{inst.reagentLevels}%</span></span>
                </div>
                
                {inst.status === 'Maintenance Required' && (
                  <Button size="xs" onClick={() => calibrate(inst.id)} disabled={isPending} className="h-7 text-[10px] bg-orange-600 hover:bg-orange-500 border-none font-bold text-white">
                    Run Calibration
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
