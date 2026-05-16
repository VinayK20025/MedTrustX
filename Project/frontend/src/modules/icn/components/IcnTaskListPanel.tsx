'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { IcnTask } from '../types/icn.types';
import { ClipboardList, ShieldAlert, Biohazard, Activity, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { tasks: IcnTask[]; selectedTaskId?: string; onSelect: (id: string) => void; }

const taskIcons: Record<string, any> = {
  'Hygiene Audit': ClipboardList,
  'PPE Audit': ShieldAlert,
  'Surveillance Check': Activity,
  'Isolation Setup': Biohazard,
  'Training': CheckCircle2,
};

const priorityColor = { High: 'text-emergency-light', Medium: 'text-warning-light', Low: 'text-success-light' };

export function IcnTaskListPanel({ tasks, selectedTaskId, onSelect }: Props) {
  // Sort: In Progress -> Pending -> Completed, then by priority (High -> Medium -> Low)
  const sorted = [...tasks].sort((a, b) => {
    if (a.status === 'In Progress' && b.status !== 'In Progress') return -1;
    if (b.status === 'In Progress' && a.status !== 'In Progress') return 1;
    if (a.status === 'Completed' && b.status !== 'Completed') return 1;
    if (b.status === 'Completed' && a.status !== 'Completed') return -1;

    const pOrder = { High: 0, Medium: 1, Low: 2 };
    return pOrder[a.priority] - pOrder[b.priority];
  });

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-teal-400" /> My Tasks
        </h3>
        <span className="text-[9px] font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded">{tasks.filter(t => t.status !== 'Completed').length} Pending</span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {sorted.map(task => {
            const Icon = taskIcons[task.type] || ClipboardList;
            return (
              <div key={task.id} onClick={() => onSelect(task.id)}
                className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                  task.status === 'Completed' ? 'border-l-gray-600 opacity-60 bg-white/[0.01]' :
                  task.status === 'In Progress' ? 'border-l-blue-500 bg-blue-500/[0.04]' : 'border-l-transparent hover:bg-white/[0.03]',
                  selectedTaskId === task.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : ''
                )}>
                <div className="flex items-start gap-3">
                  <div className={cn('p-2 rounded mt-0.5',
                    task.status === 'Completed' ? 'bg-gray-800 text-gray-500' :
                    task.priority === 'High' ? 'bg-emergency/15 text-emergency-light' : 'bg-white/10 text-teal-400'
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-[13px] font-bold truncate', task.status === 'Completed' ? 'line-through text-gray-500' : 'text-white')}>{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400">{task.ward}</span>
                      <span className="text-gray-600 text-[10px]">•</span>
                      <span className={cn('text-[10px] font-bold', priorityColor[task.priority])}>{task.priority}</span>
                    </div>
                  </div>
                  <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0',
                    task.status === 'Completed' ? 'bg-gray-800 text-gray-500' :
                    task.status === 'In Progress' ? 'bg-blue-500/20 text-blue-300 animate-pulse' : 'bg-white/10 text-gray-400'
                  )}>{task.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
