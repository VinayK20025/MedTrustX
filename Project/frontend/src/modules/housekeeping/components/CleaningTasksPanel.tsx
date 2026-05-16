'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { CleaningTask } from '../types/housekeeping.types';
import { ClipboardList, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { tasks: CleaningTask[]; selectedId?: string; onSelect: (id: string) => void; }

const priorityColor = { High: 'border-emergency bg-emergency/[0.04]', Normal: 'border-blue-500 bg-blue-500/[0.04]' };

export function CleaningTasksPanel({ tasks, selectedId, onSelect }: Props) {
  const activeTasks = tasks.filter(t => t.status !== 'Completed');

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-cyan-400" /> Cleaning Tasks
        </h3>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">{activeTasks.length} Active</span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {activeTasks.map(t => (
            <div key={t.id} onClick={() => onSelect(t.id)}
              className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                priorityColor[t.priority],
                selectedId === t.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
              )}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-gray-400">{t.area}</span>
                <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex items-center gap-1 tracking-wider',
                  t.priority === 'High' ? 'bg-emergency/15 text-emergency-light' : 'bg-blue-500/15 text-blue-300'
                )}>
                  {t.priority === 'High' && <AlertTriangle className="w-2.5 h-2.5" />}
                  {t.priority}
                </span>
              </div>
              
              <h4 className="text-[13px] font-bold text-white mb-2">{t.type}</h4>

              <div className="flex justify-between items-center text-[10px] mt-2 pt-2 border-t border-white/5">
                 <span className="text-gray-500">{t.checklist.filter(c => c.isCompleted).length} / {t.checklist.length} Steps Done</span>
                 <span className={cn('font-bold uppercase tracking-wider', t.status === 'In Progress' ? 'text-cyan-400' : 'text-gray-400')}>{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
