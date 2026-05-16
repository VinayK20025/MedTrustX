'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SafetyChecklistTask } from '../types/circulator.types';
import { useConfirmSafetyCheck } from '../hooks/useCirculatorAnalytics';
import { ClipboardCheck, CheckCircle2, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { checklist: SafetyChecklistTask[]; }

export function CirculatorSafetyPanel({ checklist }: Props) {
  const { mutate: confirm, isPending } = useConfirmSafetyCheck();

  // Group by phase to ensure linear flow (Sign In -> Time Out -> Sign Out)
  const phases = ['Sign In', 'Time Out', 'Sign Out'];

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/15"><ClipboardCheck className="w-4 h-4 text-emerald-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">WHO Safety Checklist</h3>
        </div>
      </CardHeader>

      <CardBody className="p-4 flex-1 overflow-y-auto max-h-[400px]">
        {phases.map(phase => {
          const phaseTasks = checklist.filter(t => t.phase === phase);
          if (phaseTasks.length === 0) return null;
          
          return (
            <div key={phase} className="mb-6 last:mb-0">
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-white/[0.04] pb-1">{phase} Phase</h4>
              <div className="space-y-2">
                {phaseTasks.map(task => (
                  <div key={task.id} className={cn("p-3 border rounded-xl flex items-center justify-between", 
                    task.status === 'Confirmed' ? 'bg-success/5 border-success/20' : 'bg-surface-dark border-white/5'
                  )}>
                    <div className="flex items-center gap-3">
                      {task.status === 'Confirmed' ? <CheckCircle2 className="w-4 h-4 text-success-light" /> : <div className="w-4 h-4 rounded-full border border-current opacity-50" />}
                      <span className={cn("text-[12px] font-bold", task.status === 'Confirmed' ? 'text-gray-400 line-through' : 'text-white')}>{task.description}</span>
                    </div>
                    {task.status === 'Pending' && (
                      <Button size="xs" onClick={() => confirm(task.id)} disabled={isPending} className="h-6 text-[10px] bg-emerald-600 hover:bg-emerald-500 border-none font-bold text-white" leftIcon={<ShieldAlert className="w-3 h-3" />}>
                        Verify
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
