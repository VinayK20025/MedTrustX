'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { CtProtocol, CtPatientQueue } from '../types/ctTech.types';
import { useTriggerScan } from '../hooks/useCtTechAnalytics';
import { Activity, Power, Zap } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activePatient?: CtPatientQueue; activeProtocol?: CtProtocol; }

export function CtTechScanPanel({ activePatient, activeProtocol }: Props) {
  const { mutate: triggerScan, isPending } = useTriggerScan();

  if (!activePatient || !activeProtocol) return null;

  return (
    <Card className="border-emergency-500/30 shadow-glass bg-[#050505] h-full flex flex-col font-mono relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-emergency animate-pulse" />
      <CardHeader className="border-b border-white/[0.04] p-3 flex items-center justify-between bg-black/50">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emergency-light" />
          <h3 className="text-[13px] font-bold tracking-widest text-emergency-light">X-RAY ACQUISITION</h3>
        </div>
      </CardHeader>

      <CardBody className="p-6 flex-1 flex flex-col items-center justify-center relative">
        <div className="absolute top-4 right-4 text-right">
           <div className="text-[10px] text-gray-500 tracking-widest mb-1">BOLUS DELAY</div>
           <div className="text-xl font-bold text-blue-400">{activeProtocol.parameters.contrastDelaySeconds}s</div>
        </div>

        <div className="text-center mb-8">
           <div className="text-[14px] text-gray-400 tracking-widest mb-2">PROTOCOL ARMED</div>
           <div className="text-xl font-black text-white">{activeProtocol.name}</div>
           <div className="flex items-center justify-center gap-4 mt-4">
              <div className="bg-surface-dark border border-white/5 px-4 py-2 rounded">
                 <span className="block text-[10px] text-gray-500">kVp</span>
                 <span className="text-[14px] text-white font-bold">{activeProtocol.parameters.kVp}</span>
              </div>
              <div className="bg-surface-dark border border-white/5 px-4 py-2 rounded">
                 <span className="block text-[10px] text-gray-500">mA</span>
                 <span className="text-[14px] text-white font-bold">{activeProtocol.parameters.mA}</span>
              </div>
              <div className="bg-surface-dark border border-white/5 px-4 py-2 rounded">
                 <span className="block text-[10px] text-gray-500">Pitch</span>
                 <span className="text-[14px] text-white font-bold">{activeProtocol.parameters.pitch}</span>
              </div>
           </div>
        </div>

        <Button 
          onClick={() => triggerScan()}
          disabled={isPending}
          className="w-48 h-48 rounded-full bg-emergency-600 hover:bg-emergency-500 border-4 border-emergency-800 shadow-[0_0_30px_rgba(239,68,68,0.3)] flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:bg-gray-800 disabled:border-gray-700"
        >
          <Power className="w-12 h-12 text-white" />
          <span className="text-[14px] font-black text-white tracking-widest mt-2">INITIATE<br/>EXPOSURE</span>
        </Button>
        
        <p className="text-[10px] text-gray-500 mt-8 text-center max-w-xs font-sans">Ensure patient is correctly positioned and personnel are clear of the imaging room before initiating radiation exposure.</p>
      </CardBody>
    </Card>
  );
}
