'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { MetTask, MetDevice } from '../types/met.types';
import { useUpdateMetTaskStatus } from '../hooks/useMetAnalytics';
import { ListTodo, AlertTriangle, RotateCw, Play } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';

interface Props { tasks: MetTask[]; devices: MetDevice[]; }

export function MetTaskQueue({ tasks, devices }: Props) {
  const { mutate: updateStatus, isPending } = useUpdateMetTaskStatus();
  
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/15"><ListTodo className="w-4 h-4 text-teal-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">MET Task Queue</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.03]">
          {tasks.map(task => {
            const device = devices.find(d => d.id === task.deviceId);
            return (
              <div key={task.id} className="p-5 hover:bg-white/[0.015] transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                      {task.deviceId}
                      {task.priority === 'Emergency' && <AlertTriangle className="w-4 h-4 text-emergency-light animate-pulse" />}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-1">{device?.name} ({device?.location})</p>
                  </div>
                  <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                    task.priority === 'Emergency' ? 'bg-emergency/20 text-emergency-light' : 
                    task.priority === 'Urgent' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                  )}>
                    {task.priority}
                  </span>
                </div>

                <div className="bg-surface-dark p-3 rounded-lg border border-white/[0.04] mb-4">
                  <p className="text-[11px] text-gray-300">"{task.issue}"</p>
                </div>

                <div className="flex justify-between items-center border-t border-white/[0.04] pt-3">
                  <div className="flex items-center gap-2">
                    {(task.status === 'Diagnosing' || task.status === 'Fixing' || task.status === 'Testing') && <RotateCw className="w-3.5 h-3.5 text-teal-400 animate-spin-slow" />}
                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-surface-dark px-2 py-1 rounded border border-white/5">{task.type}</span>
                  </div>
                  {task.status === 'Assigned' && (
                    <Button size="xs" onClick={() => updateStatus({ taskId: task.id, status: 'Diagnosing' })} disabled={isPending} className="h-7 text-[10px] bg-teal-600 hover:bg-teal-500 border-none font-bold text-white" leftIcon={<Play className="w-3 h-3" />}>
                      Start Diagnostics
                    </Button>
                  )}
                  {task.status !== 'Assigned' && task.status !== 'Resolved' && task.status !== 'Escalated' && (
                    <span className="text-[10px] font-bold text-teal-400 border border-teal-500/20 px-2 py-1 rounded bg-teal-500/10 uppercase tracking-wider">{task.status}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
