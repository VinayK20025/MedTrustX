'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { LabSample, ProcessingStep } from '../types/labTech.types';
import { useCompleteStep } from '../hooks/useLabTechAnalytics';
import { ClipboardList, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activeSample?: LabSample; steps: ProcessingStep[]; }

export function LabTechProcessingPanel({ activeSample, steps }: Props) {
  const { mutate: completeStep, isPending } = useCompleteStep();

  if (!activeSample) return null;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-orange-400" />
          <h3 className="text-[15px] font-bold text-white tracking-wide">Step-by-Step SOP</h3>
        </div>
        <div className="text-[10px] text-gray-400 font-mono">ID: {activeSample.id}</div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {steps.map((step, idx) => (
            <div key={step.id} className={cn("p-5 flex items-start gap-4 transition-colors", 
              step.status === 'In Progress' ? "bg-white/[0.02]" : "opacity-75"
            )}>
              <div className={cn("flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border", 
                step.status === 'Completed' ? "bg-success/20 text-success-light border-success/30" : 
                step.status === 'In Progress' ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-surface-dark text-gray-500 border-white/10"
              )}>
                {step.status === 'Completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={cn("text-[13px] font-bold", step.status === 'Completed' ? "text-gray-400 line-through" : "text-white")}>
                    {step.stepName}
                  </h4>
                  {step.isAutomated && <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono uppercase">Auto</span>}
                </div>
                <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">{step.instructions}</p>
                
                {step.status === 'In Progress' && !step.isAutomated && (
                  <Button size="sm" onClick={() => completeStep(step.id)} disabled={isPending} className="bg-orange-600 hover:bg-orange-500 text-white font-bold h-8 text-[11px]">
                    Mark Step Complete
                  </Button>
                )}
                
                {step.status === 'In Progress' && step.isAutomated && (
                  <div className="flex items-center gap-2 text-[11px] text-blue-400 font-bold bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 w-fit">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Awaiting Device Sync...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
