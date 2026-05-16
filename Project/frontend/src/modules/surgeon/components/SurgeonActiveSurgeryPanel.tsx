'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ActiveSurgery } from '../types/surgeon.types';
import { useAdvanceSurgicalStep } from '../hooks/useSurgeonAnalytics';
import { Crosshair, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { surgery?: ActiveSurgery; }

export function SurgeonActiveSurgeryPanel({ surgery }: Props) {
  const { mutate: advance, isPending } = useAdvanceSurgicalStep();

  if (!surgery) return <div className="p-10 text-center text-gray-500 border border-white/5 rounded-xl bg-surface-light">No surgery currently in progress.</div>;

  return (
    <Card className="border-blue-500/30 shadow-glass bg-surface-dark h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 animate-pulse" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between bg-surface-light">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/15"><Crosshair className="w-4 h-4 text-blue-400" /></div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">Intra-Op Tracking</h3>
            <p className="text-[11px] text-blue-300 font-mono mt-0.5">{surgery.caseId} | Phase: {surgery.currentPhase}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[20px] font-mono font-black text-white">{surgery.durationMinutes} <span className="text-[10px] text-gray-500 font-sans">MIN</span></span>
        </div>
      </CardHeader>

      <CardBody className="p-5 flex-1 overflow-y-auto max-h-[450px]">
        <div className="mb-6 grid grid-cols-2 gap-4">
           <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-center">
             <span className="text-[9px] text-gray-500 uppercase font-bold block mb-1">EBL (Blood Loss)</span>
             <span className="text-lg font-black text-emergency-light">{surgery.bloodLoss} mL</span>
           </div>
           <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-center">
             <span className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Fluids Given</span>
             <span className="text-lg font-black text-blue-300">{surgery.fluidsGiven} mL</span>
           </div>
        </div>

        <div>
          <h4 className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1.5 mb-3">Surgical Steps</h4>
          <div className="space-y-2">
            {surgery.steps.map(step => (
              <div key={step.id} className={cn("p-3 border rounded-xl flex items-center justify-between", 
                step.status === 'Completed' ? 'bg-success/5 border-success/20 text-success-light' :
                step.status === 'In Progress' ? 'bg-blue-500/10 border-blue-500/40 text-blue-300' : 'bg-surface-dark border-white/5 text-gray-500'
              )}>
                <div className="flex items-center gap-3">
                  {step.status === 'Completed' ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-current opacity-50" />}
                  <span className="text-[12px] font-bold">{step.description}</span>
                </div>
                {step.status === 'In Progress' && (
                  <Button size="xs" onClick={() => advance({ caseId: surgery.caseId, stepId: step.id })} disabled={isPending} className="h-6 text-[10px] bg-blue-600 hover:bg-blue-500 border-none font-bold text-white">
                    Complete Step
                  </Button>
                )}
                {step.status === 'Completed' && step.timestamp && (
                   <span className="text-[9px] font-mono opacity-60">{new Date(step.timestamp).toLocaleTimeString()}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
