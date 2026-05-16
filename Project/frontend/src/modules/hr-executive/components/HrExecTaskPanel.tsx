'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { HrTask } from '../types/hrExec.types';
import { useCompleteTask } from '../hooks/useHrExecAnalytics';
import { ListTodo, CheckCircle2, Circle, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { tasks: HrTask[]; }

const priorityStyle: Record<HrTask['priority'], string> = {
  Urgent: 'bg-emergency/20 text-emergency-light',
  Normal: 'bg-blue-500/20 text-blue-300',
  Low: 'bg-gray-500/20 text-gray-300',
};
const statusIcon: Record<HrTask['status'], React.ReactNode> = {
  Pending: <Circle className="w-4 h-4 text-gray-500" />,
  'In Progress': <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
  Completed: <CheckCircle2 className="w-4 h-4 text-success-light" />,
  Overdue: <AlertTriangle className="w-4 h-4 text-emergency-light" />,
};

const categoryIcon: Record<HrTask['category'], string> = {
  Leave: '📋', Attendance: '⏰', Document: '📄', Record: '🗂️', Recruitment: '👤',
};

export function HrExecTaskPanel({ tasks }: Props) {
  const { mutate: complete, isPending } = useCompleteTask();
  const pending = tasks.filter(t => t.status !== 'Completed');
  const done = tasks.filter(t => t.status === 'Completed');

  return (
    <Card className="border-teal-500/25 shadow-glass bg-[#030a08] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/15"><ListTodo className="w-4 h-4 text-teal-400" /></div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">Today's Tasks</h3>
            <span className="text-[10px] text-gray-500 font-mono">{pending.length} pending • {done.length} completed</span>
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {tasks.map(t => (
            <div key={t.id} className={cn("p-4 transition-colors",
              t.status === 'Overdue' ? "bg-emergency/[0.04] border-l-2 border-l-emergency" :
              t.status === 'Completed' ? "opacity-50" : "hover:bg-white/[0.015]"
            )}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{statusIcon[t.status]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px]">{categoryIcon[t.category]}</span>
                    <h4 className={cn("text-[12px] font-bold truncate", t.status === 'Completed' ? "text-gray-500 line-through" : "text-white")}>{t.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-mono text-gray-500">
                    <span className={cn('px-1.5 py-0.5 rounded font-bold', priorityStyle[t.priority])}>{t.priority}</span>
                    <span>{t.category}</span>
                    {t.status === 'Overdue' && t.dueBy && <span className="text-emergency-light">Overdue</span>}
                  </div>
                </div>
                {t.status !== 'Completed' && (
                  <Button size="sm" disabled={isPending} onClick={() => complete(t.id)} className="h-7 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-[10px] border border-teal-500/20 shrink-0" leftIcon={<CheckCircle2 className="w-3 h-3" />}>
                    Done
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
