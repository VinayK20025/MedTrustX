'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ResidentTask } from '../types/resident.types';
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { tasks: ResidentTask[]; }

const priorityColors: Record<string, string> = {
  high: 'border-emergency/40 bg-emergency/10 text-emergency-light',
  medium: 'border-warning/40 bg-warning/10 text-warning-light',
  low: 'border-white/10 bg-white/5 text-gray-300',
};

export function TaskBoard({ tasks }: Props) {
  const todo = tasks.filter(t => t.status === 'todo');
  const inProgress = tasks.filter(t => t.status === 'in_progress');
  const done = tasks.filter(t => t.status === 'done');

  const Column = ({ title, items, icon: Icon, color }: { title: string, items: ResidentTask[], icon: any, color: string }) => (
    <div className="flex-1 flex flex-col bg-surface-dark border border-white/[0.04] rounded-xl overflow-hidden">
      <div className={`p-3 border-b border-white/[0.04] flex items-center justify-between ${color}`}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 opacity-80" />
          <h4 className="text-xs font-bold uppercase tracking-wider">{title}</h4>
        </div>
        <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded font-mono">{items.length}</span>
      </div>
      <div className="p-3 flex-1 overflow-y-auto space-y-3">
        {items.map(t => (
          <div key={t.id} className={`p-3 rounded-lg border flex flex-col gap-2 shadow-glass ${priorityColors[t.priority]}`}>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold leading-tight">{t.title}</span>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-black/20 rounded opacity-80">{t.type}</span>
            </div>
            <div className="text-[10px] opacity-80 font-mono bg-black/10 px-2 py-1 rounded inline-block w-max">
              {t.patientName}
            </div>
            <div className="flex justify-between items-end mt-1">
              <div className="flex items-center gap-1 text-[10px] opacity-70">
                <Clock className="w-3 h-3" /> {t.dueTime}
              </div>
              {t.status !== 'done' && (
                <Button size="sm" className="h-6 text-[10px] px-2 bg-white/10 hover:bg-white/20 text-white border-none">
                  {t.status === 'todo' ? 'Start' : 'Complete'}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-lg font-semibold text-white tracking-wide">Shift Execution Board</h3>
      </CardHeader>
      <CardBody className="p-4 flex-1 flex gap-4 h-[600px]">
        <Column title="To Do" items={todo} icon={AlertCircle} color="bg-white/[0.02]" />
        <Column title="In Progress" items={inProgress} icon={Clock} color="bg-indigo-500/10 text-indigo-300" />
        <Column title="Completed" items={done} icon={CheckSquare} color="bg-success/10 text-success-light" />
      </CardBody>
    </Card>
  );
}
