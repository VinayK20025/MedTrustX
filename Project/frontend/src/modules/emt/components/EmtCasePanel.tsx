'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { EmtCase, EmtTask } from '../types/emt.types';
import { useCompleteEmtTask } from '../hooks/useEmtAnalytics';
import { User, AlertTriangle, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activeCase: EmtCase | null; tasks: EmtTask[]; }

export function EmtCasePanel({ activeCase, tasks }: Props) {
  const { mutate: completeTask } = useCompleteEmtTask();

  if (!activeCase) {
    return (
      <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col items-center justify-center p-6 text-center">
        <User className="w-12 h-12 text-gray-600 mb-3" />
        <p className="text-gray-400 font-bold">No active patient</p>
      </Card>
    );
  }

  return (
    <Card className={cn('shadow-glass h-full flex flex-col border-2 relative overflow-hidden',
      activeCase.triageLevel === 'Critical' ? 'border-emergency bg-emergency/[0.05]' : 'border-warning bg-warning/[0.05]'
    )}>
      {activeCase.triageLevel === 'Critical' && (
         <div className="absolute top-0 left-0 w-full h-1 bg-emergency-light animate-pulse" />
      )}

      <CardHeader className="border-b border-white/[0.04] p-4 bg-black/20">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{activeCase.location}</span>
          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1',
            activeCase.triageLevel === 'Critical' ? 'bg-emergency/20 text-emergency-light' : 'bg-warning/20 text-warning-light'
          )}>
            {activeCase.triageLevel === 'Critical' && <AlertTriangle className="w-3 h-3" />}
            {activeCase.triageLevel} Triage
          </span>
        </div>
        <h3 className="text-[20px] font-black text-white leading-tight mb-1">{activeCase.patientName}</h3>
        <p className="text-[12px] text-gray-400">{activeCase.age}y • {activeCase.gender} • {activeCase.complaint}</p>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto bg-black/30">
        <div className="p-4 border-b border-white/5">
           <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-3">Required Procedure Setup</p>
           <div className="space-y-2">
             {tasks.map(t => (
                <div key={t.id} onClick={() => !t.isCompleted && completeTask(t.id)}
                  className={cn('flex items-center gap-3 p-3 rounded-lg border transition-all',
                    t.isCompleted ? 'bg-success/10 border-success/30 text-success-light' : 'bg-white/[0.02] border-white/10 text-white cursor-pointer hover:bg-white/[0.05]'
                  )}>
                  {t.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 text-gray-500" />}
                  <div className="flex-1">
                     <span className={cn('text-[14px] font-bold block', t.isCompleted && 'line-through opacity-70')}>{t.label}</span>
                     {t.priority === 'High' && !t.isCompleted && (
                        <span className="text-[9px] font-bold text-emergency-light uppercase tracking-widest mt-0.5 block">High Priority</span>
                     )}
                  </div>
                </div>
             ))}
           </div>
        </div>
      </CardBody>
    </Card>
  );
}
