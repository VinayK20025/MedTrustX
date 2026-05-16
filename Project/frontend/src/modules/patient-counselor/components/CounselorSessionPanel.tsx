'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { CounselingSession, TreatmentExplanation } from '../types/patientCounselor.types';
import { useMarkPointDiscussed, useCompleteCounseling } from '../hooks/usePatientCounselorAnalytics';
import { HeartHandshake, CheckCircle2, Circle, Stethoscope, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { session?: CounselingSession; treatment?: TreatmentExplanation; }

export function CounselorSessionPanel({ session, treatment }: Props) {
  const { mutate: markDiscussed } = useMarkPointDiscussed();
  const { mutate: completeCounseling, isPending } = useCompleteCounseling();

  if (!session || !treatment) return null;

  const allDiscussed = session.talkingPoints.every(tp => tp.discussed);

  return (
    <Card className="border-rose-500/30 shadow-glass bg-[#0a0405] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-rose-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-rose-400">COUNSELING SESSION</h3>
        </div>
        <div className="text-[10px] text-gray-400 font-mono">Patient: {session.patientId}</div>
      </CardHeader>

      <CardBody className="p-0 flex-1 flex flex-col overflow-hidden">
        {/* Treatment Plain Language Summary */}
        <div className="p-5 bg-white/[0.02] border-b border-white/5">
           <h4 className="text-[14px] font-bold text-white mb-2 flex items-center gap-2">
             <Stethoscope className="w-4 h-4 text-gray-400"/> {treatment.title}
           </h4>
           <p className="text-[13px] text-gray-300 leading-relaxed mb-4">{treatment.plainLanguageSummary}</p>
           
           <div className="grid grid-cols-2 gap-4 text-[11px]">
             <div className="bg-black/20 p-3 rounded border border-white/5">
               <span className="block text-gray-500 mb-1">Duration / Recovery</span>
               <span className="font-bold text-white">{treatment.duration}</span>
             </div>
             <div className="bg-black/20 p-3 rounded border border-white/5">
               <span className="block text-gray-500 mb-1">Success Rate</span>
               <span className="font-bold text-success-light">{treatment.successRate}</span>
             </div>
           </div>
        </div>

        {/* Discussion Checklist */}
        <div className="flex-1 overflow-y-auto p-5">
          <h5 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Session Talking Points</h5>
          <div className="space-y-3">
            {session.talkingPoints.map(tp => (
              <div key={tp.id} className={cn("p-4 rounded-xl border flex items-center justify-between transition-colors cursor-pointer", 
                  tp.discussed ? "bg-success/10 border-success/30" : "bg-surface-dark border-white/10 hover:border-white/20"
              )} onClick={() => !tp.discussed && markDiscussed({ sessionId: session.id, pointId: tp.id })}>
                <div>
                  <h4 className={cn("text-[13px] font-bold mb-1", tp.discussed ? "text-success-light" : "text-white")}>{tp.topic}</h4>
                  <p className="text-[11px] text-gray-400">{tp.content}</p>
                </div>
                {tp.discussed ? <CheckCircle2 className="w-5 h-5 text-success-400"/> : <Circle className="w-5 h-5 text-gray-600"/>}
              </div>
            ))}
          </div>

          {/* Patient Concerns */}
          <div className="mt-6">
            <h5 className="text-[11px] font-bold text-warning-light uppercase tracking-widest mb-3 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5"/> Key Patient Concerns
            </h5>
            <ul className="list-disc list-inside text-[12px] text-gray-300 space-y-1">
              {session.patientConcerns.map((concern, idx) => <li key={idx}>{concern}</li>)}
            </ul>
          </div>
        </div>
        
        {/* Action Bar */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end items-center">
          <Button 
            disabled={!allDiscussed || isPending} 
            onClick={() => completeCounseling(session.patientId)}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold h-10 px-8"
          >
            COMPLETE SESSION
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
