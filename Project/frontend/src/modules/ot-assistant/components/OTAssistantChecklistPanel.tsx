'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SetupChecklistTask } from '../types/otAssistant.types';
import { useCompleteChecklistTask } from '../hooks/useOTAssistantAnalytics';
import { ClipboardList, CheckCircle2, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { checklist: SetupChecklistTask[]; }

export function OTAssistantChecklistPanel({ checklist }: Props) {
  const { mutate: completeTask, isPending } = useCompleteChecklistTask();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/15"><ClipboardList className="w-4 h-4 text-emerald-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Pre-Op Setup Checklist</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[450px]">
        <div className="divide-y divide-white/[0.03]">
          {checklist.map(task => (
            <div key={task.id} className="p-5 hover:bg-white/[0.015] transition-colors flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {task.status === 'Completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-success-light" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-white/20" />
                  )}
                </div>
                <div>
                  <h4 className={cn("text-[13px] font-bold", task.status === 'Completed' ? "text-gray-400 line-through" : "text-white")}>
                    {task.description}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/5 text-gray-400">{task.category}</span>
                    <span className="text-[9px] font-mono text-gray-500">{task.caseId}</span>
                  </div>
                  {task.verifiedBy && <p className="text-[10px] text-emerald-400 mt-1 italic flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> Verified by {task.verifiedBy}</p>}
                </div>
              </div>
              
              {task.status === 'Pending' && (
                <Button size="xs" onClick={() => completeTask(task.id)} disabled={isPending} className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-500 border-none font-bold text-white">
                  Confirm
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
