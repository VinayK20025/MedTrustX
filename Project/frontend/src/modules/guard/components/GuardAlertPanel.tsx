'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { GuardTask, GuardTaskPriority } from '../types/guard.types';
import { Bell, Siren, MapPin } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { tasks: GuardTask[]; selectedId?: string; onSelect: (id: string) => void; }

const priorityConfig: Record<GuardTaskPriority, { border: string; badge: string; dot: string }> = {
  Emergency: { border: 'border-l-emergency', badge: 'bg-emergency/20 text-emergency-light border border-emergency/40 animate-pulse', dot: 'bg-emergency-light animate-ping' },
  High: { border: 'border-l-orange-500', badge: 'bg-orange-500/20 text-orange-300', dot: 'bg-orange-400' },
  Normal: { border: 'border-l-transparent', badge: 'bg-blue-500/20 text-blue-300', dot: 'bg-blue-400' },
};

export function GuardAlertPanel({ tasks, selectedId, onSelect }: Props) {
  const sorted = [...tasks].sort((a, b) => {
    const order = { Emergency: 0, High: 1, Normal: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-red-500/15"><Bell className="w-4 h-4 text-red-400" /></div>
          <h3 className="text-[14px] font-bold text-white">My Tasks</h3>
        </div>
        <span className="text-[10px] font-bold bg-emergency/20 text-emergency-light px-2 py-0.5 rounded border border-emergency/30">
          {tasks.filter(t => t.priority === 'Emergency').length} Emergency
        </span>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {sorted.map(task => {
            const cfg = priorityConfig[task.priority];
            return (
              <div key={task.id} onClick={() => onSelect(task.id)}
                className={cn('p-4 cursor-pointer border-l-4 transition-all group relative',
                  cfg.border,
                  task.isEmergency ? 'bg-emergency/[0.04] hover:bg-emergency/[0.08]' : 'hover:bg-white/[0.02]',
                  selectedId === task.id ? 'bg-white/[0.06] ring-1 ring-inset ring-white/10' : ''
                )}>
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={cn('shrink-0 w-2 h-2 rounded-full', cfg.dot)} />
                    <h4 className={cn('text-[13px] font-bold truncate', task.isEmergency ? 'text-emergency-light' : 'text-white group-hover:text-red-300 transition-colors')}>
                      {task.title}
                    </h4>
                  </div>
                  <span className={cn('ml-2 shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase', cfg.badge)}>{task.priority}</span>
                </div>
                <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-gray-500 shrink-0" /> {task.location}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded',
                    task.status === 'Done' ? 'bg-success/10 text-success-light' :
                    task.status === 'In Progress' ? 'bg-blue-500/10 text-blue-300' :
                    'bg-white/5 text-gray-400'
                  )}>{task.status}</span>
                  <span className="text-[9px] text-gray-600 font-mono">{task.type}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
