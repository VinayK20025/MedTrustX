'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { PostOpCleanupTask } from '../types/otAssistant.types';
import { RefreshCcw, CheckCircle2, RotateCw } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { tasks: PostOpCleanupTask[]; }

export function OTAssistantPostOpPanel({ tasks }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/15"><RefreshCcw className="w-4 h-4 text-teal-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Post-Op Cleanup</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        <div className="divide-y divide-white/[0.03]">
          {tasks.map(task => (
            <div key={task.id} className="p-5 hover:bg-white/[0.015] transition-colors flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {task.status === 'Completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-success-light" />
                  ) : task.status === 'In Progress' ? (
                    <RotateCw className="w-5 h-5 text-blue-400 animate-spin-slow" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-white/20" />
                  )}
                </div>
                <div>
                  <h4 className={cn("text-[13px] font-bold", task.status === 'Completed' ? "text-gray-400 line-through" : "text-white")}>
                    {task.description}
                  </h4>
                  <div className="mt-1 text-[9px] font-mono text-gray-500">{task.caseId}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
