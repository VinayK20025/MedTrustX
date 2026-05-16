'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ClinicalProtocolStep } from '../types/er-paramedic.types';
import { useLogEmergencyAction, useCompleteProtocolStep } from '../hooks/useERParamedicAnalytics';
import { HeartPulse, Zap, Syringe, Activity, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { protocols: ClinicalProtocolStep[]; }

export function CodeResponseWorkspace({ protocols }: Props) {
  const { mutate: logAction } = useLogEmergencyAction();
  const { mutate: completeStep } = useCompleteProtocolStep();

  return (
    <Card className="border-red-600/20 shadow-glass bg-[#050101] h-full flex flex-col relative overflow-hidden">
      
      <CardHeader className="border-b border-red-600/10 p-5 bg-black/60">
        <h3 className="text-[16px] font-black text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-red-500" /> ACLS Protocol Guidance (Live)
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Automated sequence based on rhythm assessment.</p>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto flex flex-col">

        {/* Protocol Sequence */}
        <div className="p-5 space-y-3">
          <p className="text-[10px] font-bold text-red-400/70 uppercase tracking-widest mb-1">Required Algorithm Steps</p>
          {protocols.map(p => (
            <div key={p.id} onClick={() => !p.isCompleted && completeStep(p.id)}
              className={cn('p-4 rounded-xl border-2 flex items-center gap-4 transition-all',
                p.isCompleted ? 'bg-success/10 border-success/30 text-success-light' : 'bg-white/[0.03] border-white/10 text-white cursor-pointer hover:bg-white/[0.06]'
              )}>
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors',
                p.isCompleted ? 'bg-success/20 text-success-light' : 'bg-white/10 text-gray-400'
              )}>
                {p.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : (
                  p.type === 'Drug' ? <Syringe className="w-5 h-5" /> :
                  p.type === 'Shock' ? <Zap className="w-5 h-5 text-yellow-400" /> : <HeartPulse className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                 <span className={cn('text-[16px] font-black block', p.isCompleted && 'line-through opacity-70')}>{p.action}</span>
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{p.type}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Massive Override Buttons */}
        <div className="p-5 mt-auto border-t border-red-600/10 bg-black/50">
           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 text-center">Immediate Action Overrides</p>
           <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => logAction('Administer Shock (200J)')} className="h-16 text-[15px] font-black bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 hover:bg-yellow-500/30" leftIcon={<Zap className="w-5 h-5" />}>DELIVER SHOCK</Button>
              <Button onClick={() => logAction('Push Epinephrine')} className="h-16 text-[15px] font-black bg-purple-500/20 text-purple-400 border border-purple-500/40 hover:bg-purple-500/30" leftIcon={<Syringe className="w-5 h-5" />}>PUSH EPI</Button>
              <Button onClick={() => logAction('Start Chest Compressions')} className="col-span-2 h-14 text-[14px] font-black bg-red-600/20 text-red-500 border border-red-600/40 hover:bg-red-600/30" leftIcon={<HeartPulse className="w-5 h-5" />}>START COMPRESSIONS</Button>
           </div>
        </div>

      </CardBody>
    </Card>
  );
}
