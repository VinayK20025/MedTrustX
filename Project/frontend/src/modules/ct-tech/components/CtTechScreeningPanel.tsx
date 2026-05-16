'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { CtPatientQueue, ContrastScreening } from '../types/ctTech.types';
import { useAnswerScreeningQuestion, useSignScreening } from '../hooks/useCtTechAnalytics';
import { ShieldAlert, CheckCircle2, XCircle, Beaker } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activePatient?: CtPatientQueue; screening?: ContrastScreening; }

export function CtTechScreeningPanel({ activePatient, screening }: Props) {
  const { mutate: answerQuestion } = useAnswerScreeningQuestion();
  const { mutate: signScreening, isPending } = useSignScreening();

  if (!activePatient || !screening) return null;

  const allAnswered = screening.questions.every(q => q.isSafe !== null);
  const hasContraindication = screening.questions.some(q => q.isSafe === false && q.isCriticalBlocker);
  const badKidneys = screening.egfrValue !== undefined && screening.egfrValue < 30; // eGFR < 30 is bad for contrast
  
  const isBlocked = hasContraindication || badKidneys;

  return (
    <Card className={cn("shadow-glass h-full flex flex-col relative overflow-hidden", isBlocked ? "border-emergency/50 bg-[#1a0505]" : "border-orange-500/30 bg-[#0a0505]")}>
      <div className={cn("absolute top-0 left-0 w-1 h-full", isBlocked ? "bg-emergency" : "bg-orange-500")} />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className={cn("w-4 h-4", isBlocked ? "text-emergency-light" : "text-orange-400")} />
          <h3 className={cn("text-[13px] font-bold tracking-widest", isBlocked ? "text-emergency-light" : "text-orange-400")}>CONTRAST ALLERGY & PREP</h3>
        </div>
        <div className="text-[10px] text-gray-400 font-mono">Patient: {activePatient.mrn}</div>
      </CardHeader>

      <CardBody className="p-0 flex-1 flex flex-col">
        <div className="p-4 bg-white/[0.02] border-b border-white/5 flex gap-4">
           <div className={cn("flex-1 p-3 rounded-lg border", badKidneys ? "bg-emergency/10 border-emergency/30" : "bg-surface-dark border-white/10")}>
             <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Renal Function (eGFR)</span>
             <span className={cn("text-xl font-black font-mono flex items-center gap-2", badKidneys ? "text-emergency-light" : "text-white")}>
               <Beaker className="w-5 h-5"/> {screening.egfrValue ?? 'N/A'} {badKidneys && <span className="text-[10px] bg-emergency-600 text-white px-2 py-0.5 rounded ml-2">CONTRAST RISK</span>}
             </span>
           </div>
        </div>

        <div className="divide-y divide-white/[0.03] flex-1 overflow-y-auto">
          {screening.questions.map(q => (
            <div key={q.id} className={cn("p-5 flex items-start justify-between gap-4 transition-colors", 
              q.isSafe === false && q.isCriticalBlocker ? "bg-emergency/10" : "hover:bg-white/[0.015]"
            )}>
              <div className="flex-1">
                <h4 className={cn("text-[13px] font-bold", q.isSafe === false ? "text-emergency-light" : "text-white")}>{q.text}</h4>
                {q.isCriticalBlocker && <span className="text-[9px] uppercase font-bold text-emergency-light bg-emergency/20 px-1.5 py-0.5 rounded mt-1 inline-block">Critical Blocker</span>}
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button size="sm" 
                  onClick={() => answerQuestion({ screeningId: screening.id, questionId: q.id, isSafe: true })}
                  className={cn("h-8 px-3 font-bold text-[11px]", q.isSafe === true ? "bg-success text-white" : "bg-surface-dark border border-white/10 text-gray-400")}
                  leftIcon={q.isSafe === true ? <CheckCircle2 className="w-3.5 h-3.5" /> : undefined}
                >
                  No (Safe)
                </Button>
                <Button size="sm" 
                  onClick={() => answerQuestion({ screeningId: screening.id, questionId: q.id, isSafe: false })}
                  className={cn("h-8 px-3 font-bold text-[11px]", q.isSafe === false ? "bg-emergency text-white" : "bg-surface-dark border border-white/10 text-gray-400")}
                  leftIcon={q.isSafe === false ? <XCircle className="w-3.5 h-3.5" /> : undefined}
                >
                  Yes (Risk)
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-between items-center">
          <div>
            {isBlocked && <p className="text-[12px] font-bold text-emergency-light flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> CONTRAST CONTRAINDICATED. SCAN BLOCKED.</p>}
          </div>
          <Button 
            disabled={!allAnswered || isBlocked || isPending} 
            onClick={() => signScreening(screening.id)}
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold"
          >
            Clear for Contrast
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
