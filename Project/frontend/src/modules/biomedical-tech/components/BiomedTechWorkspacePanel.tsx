'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { BiomedTask, BiomedDevice } from '../types/biomedTech.types';
import { useUpdateChecklistStep, useUpdateTaskStatus, useEscalateTask } from '../hooks/useBiomedTechAnalytics';
import { Wrench, CheckCircle2, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { task?: BiomedTask; device?: BiomedDevice; }

export function BiomedTechWorkspacePanel({ task, device }: Props) {
  const { mutate: updateStep } = useUpdateChecklistStep();
  const { mutate: finishTask } = useUpdateTaskStatus();
  const { mutate: escalate } = useEscalateTask();

  if (!task) {
    return (
      <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col items-center justify-center min-h-[400px]">
        <Wrench className="w-12 h-12 text-gray-600 mb-4 opacity-50" />
        <p className="text-gray-500 font-bold">Select a task to begin execution.</p>
      </Card>
    );
  }

  const allDone = task.checklist.every(s => s.isCompleted);

  return (
    <Card className="border-orange-500/30 shadow-glass bg-surface-light h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 animate-pulse" />
      <div className="border-b border-white/[0.04] px-5 py-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-bold text-white">Active Workspace: {task.deviceId}</h3>
          </div>
          <span className="text-[10px] text-orange-400 font-bold bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">IN PROGRESS</span>
        </div>
        <div className="text-[11px] text-gray-400">Target: {device?.name} at {device?.location} ({device?.department})</div>
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="p-5 border-b border-white/[0.04]">
          <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-3">Execution Checklist</h4>
          <div className="space-y-3">
            {task.checklist.map((step, idx) => (
              <div key={step.id} className={cn("p-4 border rounded-xl flex items-center justify-between transition-colors", 
                step.isCompleted ? 'bg-success/5 border-success/20' : 'bg-surface-dark border-white/5'
              )}>
                <div className="flex items-center gap-3">
                  <div className="font-mono text-gray-600 text-[10px] w-4">{idx + 1}.</div>
                  {step.isCompleted ? <CheckCircle2 className="w-5 h-5 text-success-light" /> : <div className="w-5 h-5 rounded-full border-2 border-white/20" />}
                  <span className={cn("text-[13px] font-bold", step.isCompleted ? 'text-gray-400 line-through' : 'text-white')}>{step.description}</span>
                </div>
                {!step.isCompleted && (
                  <Button size="xs" onClick={() => updateStep({ taskId: task.id, stepId: step.id, isCompleted: true })} className="h-8 text-[11px] bg-white/10 hover:bg-white/20 border-none font-bold text-white">
                    Mark Done
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 flex justify-between items-center bg-black/20">
          <Button variant="ghost" size="sm" onClick={() => escalate({ taskId: task.id, reason: 'Requires engineer support' })} className="text-emergency-light hover:bg-emergency/10" leftIcon={<ShieldAlert className="w-4 h-4" />}>
            Escalate to Engineer
          </Button>
          
          <Button onClick={() => finishTask({ taskId: task.id, status: 'Completed' })} disabled={!allDone} className={cn("font-bold", allDone ? "bg-success hover:bg-success-light text-white" : "bg-surface-dark text-gray-500")}>
            Complete Task
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
