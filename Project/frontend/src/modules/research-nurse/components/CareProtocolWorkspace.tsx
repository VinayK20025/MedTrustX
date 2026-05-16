'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { CareProtocolStep } from '../types/research-nurse.types';
import { useCompleteProtocolStep } from '../hooks/useResearchNurseAnalytics';
import { Stethoscope, Pill, HeartPulse, TestTube, Eye, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { steps: CareProtocolStep[]; }

const StepIcon: Record<string, React.ElementType> = { Consent: ShieldCheck, 'Drug Admin': Pill, Vitals: HeartPulse, Sample: TestTube, Observation: Eye };

export function CareProtocolWorkspace({ steps }: Props) {
  const { mutate: completeStep } = useCompleteProtocolStep();
  const allDone = steps.every(s => s.isCompleted);

  return (
    <Card className="border-teal-500/20 shadow-glass bg-[#020405] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-800 via-cyan-500 to-emerald-400" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-[16px] font-black text-white flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-teal-400" /> Study Visit Protocol
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Complete each step sequentially. Skipping steps is blocked per GCP requirements.</p>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto flex flex-col">

        <div className="p-5 space-y-3 flex-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Visit Workflow — Ordered Steps</p>
          {steps.map((step, idx) => {
            const Icon = StepIcon[step.type] || Stethoscope;
            const isNext = !step.isCompleted && (idx === 0 || steps[idx - 1].isCompleted);

            return (
              <div key={step.id}
                onClick={() => isNext && completeStep(step.id)}
                className={cn('p-4 rounded-xl border-2 flex items-center gap-4 transition-all',
                  step.isCompleted ? 'bg-success/10 border-success/30 text-success-light' :
                  isNext ? 'bg-white/[0.04] border-teal-500/40 text-white cursor-pointer hover:bg-white/[0.06] ring-1 ring-teal-500/20 active:scale-[0.98]' :
                  'bg-white/[0.01] border-white/5 text-gray-500 opacity-50'
                )}>
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                  step.isCompleted ? 'bg-success/20 text-success-light' :
                  isNext ? 'bg-teal-500/20 text-teal-400' : 'bg-white/5 text-gray-600'
                )}>
                  {step.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <span className={cn('text-[14px] font-bold block', step.isCompleted && 'line-through opacity-70')}>{step.label}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{step.type}</span>
                    {step.timeSensitive && !step.isCompleted && step.dueAt && (
                      <span className="text-[9px] font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 animate-pulse">
                        <Clock className="w-2.5 h-2.5" /> Due {new Date(step.dueAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-5 border-t border-white/5 bg-black/40">
          <Button disabled={!allDone} className={cn('w-full h-12 text-[13px] font-bold border',
            allDone ? 'bg-success/20 text-success-light border-success/40 hover:bg-success/30' : 'bg-white/5 text-gray-500 border-white/10 cursor-not-allowed'
          )} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
            {allDone ? 'Close Visit & Submit Data' : 'Complete All Protocol Steps First'}
          </Button>
        </div>

      </CardBody>
    </Card>
  );
}
