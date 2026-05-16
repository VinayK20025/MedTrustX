'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { AnesthesiaSetupTask } from '../types/anesthesiaTech.types';
import { useVerifySetupTask } from '../hooks/useAnesthesiaTechAnalytics';
import { CheckSquare, CheckCircle2, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { checklist: AnesthesiaSetupTask[]; }

export function AnesthesiaSetupPanel({ checklist }: Props) {
  const { mutate: verifyTask, isPending } = useVerifySetupTask();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/15"><CheckSquare className="w-4 h-4 text-indigo-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Pre-Op Airway & Machine Setup</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[350px]">
        <div className="divide-y divide-white/[0.03]">
          {checklist.map(task => (
            <div key={task.id} className="p-5 hover:bg-white/[0.015] transition-colors flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {task.status === 'Verified' ? (
                    <CheckCircle2 className="w-5 h-5 text-success-light" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-white/20" />
                  )}
                </div>
                <div>
                  <h4 className={cn("text-[13px] font-bold", task.status === 'Verified' ? "text-gray-400 line-through" : "text-white")}>
                    {task.description}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/5 text-gray-400">{task.category}</span>
                    <span className="text-[9px] font-mono text-gray-500">{task.otRoom} | {task.caseId}</span>
                  </div>
                </div>
              </div>
              
              {task.status === 'Pending' && (
                <Button size="xs" onClick={() => verifyTask(task.id)} disabled={isPending} className="h-7 text-[10px] bg-indigo-600 hover:bg-indigo-500 border-none font-bold text-white">
                  Verify Complete
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
