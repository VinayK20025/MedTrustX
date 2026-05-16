'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PhlebotomyPatient, VerificationStep } from '../types/phlebotomy.types';
import { useVerifyStep } from '../hooks/usePhlebotomyAnalytics';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activePatient?: PhlebotomyPatient; steps: VerificationStep[]; }

export function PhlebotomyPreparationPanel({ activePatient, steps }: Props) {
  const { mutate: verify, isPending } = useVerifyStep();

  if (!activePatient) return null;

  return (
    <Card className="border-pink-500/30 shadow-glass bg-[#0a0a0a] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-pink-500 animate-pulse" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-pink-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-gray-400">PATIENT VERIFICATION & SAFETY</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="p-4 bg-white/[0.02] border-b border-white/5 mb-2">
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold mb-1">Active Patient</p>
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-black text-white">{activePatient.patientName}</h2>
            <p className="font-mono text-pink-400 text-[12px]">{activePatient.mrn}</p>
          </div>
        </div>

        <div className="divide-y divide-white/[0.03]">
          {steps.map((step, idx) => (
            <div key={step.id} className={cn("p-5 flex items-start gap-4 transition-colors", 
              !step.isVerified ? "bg-white/[0.02]" : "opacity-75"
            )}>
              <div className={cn("flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border", 
                step.isVerified ? "bg-success/20 text-success-light border-success/30" : "bg-pink-500/20 text-pink-400 border-pink-500/30"
              )}>
                {step.isVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={cn("text-[13px] font-bold", step.isVerified ? "text-gray-400 line-through" : "text-white")}>
                    {step.stepName}
                  </h4>
                  {step.isRequired && <span className="text-[9px] bg-emergency/20 text-emergency-light px-1.5 py-0.5 rounded font-mono uppercase">Required</span>}
                </div>
                <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">{step.description}</p>
                
                {!step.isVerified && (
                  <Button size="sm" onClick={() => verify(step.id)} disabled={isPending} className="bg-pink-600 hover:bg-pink-500 text-white font-bold h-8 text-[11px]">
                    Confirm Verified
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
