'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ProcessingTask, TaskPriority } from '../types/processing.types';
import { ListChecks, Search, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { tasks: ProcessingTask[]; selectedId?: string; onSelect: (id: string) => void; }

const priorityColor: Record<TaskPriority, string> = {
  Routine: 'bg-gray-500/20 text-gray-300',
  High: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  Critical: 'bg-emergency/20 text-emergency-light border border-emergency/30 animate-pulse',
};

export function ProcessingTaskQueue({ tasks, selectedId, onSelect }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-blue-500/15"><ListChecks className="w-3.5 h-3.5 text-blue-400" /></div>
          <h3 className="text-[13px] font-bold text-white tracking-wide">Execution Queue</h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input type="text" placeholder="Search tasks or reference ID..." className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-[11px] text-white focus:outline-none focus:border-blue-500/50" />
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {tasks.map(t => {
            const hasErrors = t.validationIssues.some(v => v.severity === 'Error');
            return (
              <div key={t.id} onClick={() => onSelect(t.id)}
                className={cn("p-4 cursor-pointer transition-all border-l-2 relative",
                  selectedId === t.id ? "bg-blue-500/[0.06] border-l-blue-500" :
                  t.status === 'Blocked' ? "bg-emergency/[0.02] border-l-emergency hover:bg-emergency/[0.04]" :
                  "border-l-transparent hover:bg-white/[0.015]"
                )}>
                <div className="flex justify-between items-start mb-1 pr-2">
                  <div>
                    <h4 className="text-[12px] font-bold text-white flex items-center gap-1.5">
                      {t.referenceId}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{t.patientName} • {t.type}</p>
                  </div>
                  <span className={cn('text-[9px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wider whitespace-nowrap', priorityColor[t.priority])}>{t.priority}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", 
                    t.status === 'Blocked' ? 'bg-emergency/10 text-emergency-light' : 
                    t.status === 'In Progress' ? 'bg-blue-500/10 text-blue-300' : 'bg-gray-500/10 text-gray-400'
                  )}>{t.status}</span>
                  {hasErrors && <span className="flex items-center gap-1 text-[9px] text-emergency-light font-bold"><AlertTriangle className="w-3 h-3" /> Errors</span>}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
