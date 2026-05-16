'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { MriPatientQueue, SafetyChecklist } from '../types/mriTech.types';
import { useAnswerSafetyQuestion, useSignSafetyChecklist } from '../hooks/useMriTechAnalytics';
import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activePatient?: MriPatientQueue; checklist?: SafetyChecklist; }

export function MriTechScreeningPanel({ activePatient, checklist }: Props) {
  const { mutate: answerQuestion } = useAnswerSafetyQuestion();
  const { mutate: signChecklist, isPending } = useSignSafetyChecklist();

  if (!activePatient || !checklist) return null;

  const allAnswered = checklist.questions.every(q => q.isSafe !== null);
  const hasContraindication = checklist.questions.some(q => q.isSafe === false && q.isCriticalBlocker);

  return (
    <Card className={cn("shadow-glass h-full flex flex-col relative overflow-hidden", hasContraindication ? "border-emergency/50 bg-[#1a0505]" : "border-indigo-500/30 bg-[#05050a]")}>
      <div className={cn("absolute top-0 left-0 w-1 h-full", hasContraindication ? "bg-emergency" : "bg-indigo-500")} />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className={cn("w-4 h-4", hasContraindication ? "text-emergency-light" : "text-indigo-400")} />
          <h3 className={cn("text-[13px] font-bold tracking-widest", hasContraindication ? "text-emergency-light" : "text-indigo-400")}>MAGNETIC SAFETY SCREENING</h3>
        </div>
        <div className="text-[10px] text-gray-400 font-mono">Patient: {activePatient.mrn}</div>
      </CardHeader>

      <CardBody className="p-0 flex-1 flex flex-col">
        <div className="p-4 bg-white/[0.02] border-b border-white/5">
           <p className="text-[11px] text-gray-400 mb-1 leading-relaxed">Ensure all questions are answered directly by the patient. Any 'Yes' to a critical blocker will immediately halt the MRI procedure.</p>
        </div>

        <div className="divide-y divide-white/[0.03] flex-1 overflow-y-auto">
          {checklist.questions.map(q => (
            <div key={q.id} className={cn("p-5 flex items-start justify-between gap-4 transition-colors", 
              q.isSafe === false && q.isCriticalBlocker ? "bg-emergency/10" : "hover:bg-white/[0.015]"
            )}>
              <div className="flex-1">
                <h4 className={cn("text-[13px] font-bold", q.isSafe === false ? "text-emergency-light" : "text-white")}>{q.text}</h4>
                {q.isCriticalBlocker && <span className="text-[9px] uppercase font-bold text-emergency-light bg-emergency/20 px-1.5 py-0.5 rounded mt-1 inline-block">Critical Blocker</span>}
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button size="sm" 
                  onClick={() => answerQuestion({ checklistId: checklist.id, questionId: q.id, isSafe: true })}
                  className={cn("h-8 px-3 font-bold text-[11px]", q.isSafe === true ? "bg-success text-white" : "bg-surface-dark border border-white/10 text-gray-400")}
                  leftIcon={q.isSafe === true ? <CheckCircle2 className="w-3.5 h-3.5" /> : undefined}
                >
                  No (Safe)
                </Button>
                <Button size="sm" 
                  onClick={() => answerQuestion({ checklistId: checklist.id, questionId: q.id, isSafe: false })}
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
            {hasContraindication && <p className="text-[12px] font-bold text-emergency-light flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> CONTRAINDICATION DETECTED. SCAN BLOCKED.</p>}
          </div>
          <Button 
            disabled={!allAnswered || hasContraindication || isPending} 
            onClick={() => signChecklist(checklist.id)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
          >
            Sign Safety Clearance
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
