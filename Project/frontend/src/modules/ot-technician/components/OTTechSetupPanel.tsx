'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { EquipmentSetupTask } from '../types/otTech.types';
import { useUpdateSetupTask } from '../hooks/useOTTechAnalytics';
import { Wrench, CheckCircle2, RotateCw } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { tasks: EquipmentSetupTask[]; }

export function OTTechSetupPanel({ tasks }: Props) {
  const { mutate: updateTask, isPending } = useUpdateSetupTask();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/15"><Wrench className="w-4 h-4 text-indigo-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Pre-Op Equipment Setup</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[350px]">
        <div className="divide-y divide-white/[0.03]">
          {tasks.map(task => (
            <div key={task.id} className="p-5 hover:bg-white/[0.015] transition-colors flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {task.status === 'Ready' ? (
                    <CheckCircle2 className="w-5 h-5 text-success-light" />
                  ) : task.status === 'Testing' ? (
                    <RotateCw className="w-5 h-5 text-blue-400 animate-spin-slow" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-white/20" />
                  )}
                </div>
                <div>
                  <h4 className={cn("text-[13px] font-bold", task.status === 'Ready' ? "text-gray-400 line-through" : "text-white")}>
                    {task.description}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/5 text-gray-400">{task.deviceType}</span>
                    <span className="text-[9px] font-mono text-gray-500">{task.otRoom} | {task.caseId}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {task.status === 'Pending' && (
                  <Button size="xs" onClick={() => updateTask({ taskId: task.id, status: 'Testing' })} disabled={isPending} className="h-7 text-[10px] bg-blue-600 hover:bg-blue-500 border-none font-bold text-white">
                    Start Test
                  </Button>
                )}
                {task.status === 'Testing' && (
                  <Button size="xs" onClick={() => updateTask({ taskId: task.id, status: 'Ready' })} disabled={isPending} className="h-7 text-[10px] bg-success hover:bg-success-light border-none font-bold text-white">
                    Mark Ready
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
