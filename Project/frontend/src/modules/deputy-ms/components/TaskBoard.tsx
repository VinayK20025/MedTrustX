'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { TaskItem } from '../types/deputy-ms.types';
import { LayoutList, Check } from 'lucide-react';
import { useCompleteDeputyTask } from '../hooks/useDeputyMSAnalytics';

interface Props { tasks: TaskItem[]; }

const priorityStyle: Record<string, string> = {
  critical: 'bg-emergency text-white',
  high:     'bg-emergency/20 text-emergency-light border border-emergency/30',
  medium:   'bg-warning/20 text-warning-light border border-warning/30',
  low:      'bg-white/10 text-gray-300 border border-white/20',
};
const statusStyle: Record<string, { color: string; col: string }> = {
  pending:     { color: 'text-gray-400', col: 'Pending' },
  assigned:    { color: 'text-warning-light', col: 'Assigned' },
  in_progress: { color: 'text-indigo-300', col: 'In Progress' },
  completed:   { color: 'text-success-light', col: 'Done' },
};

export function TaskBoard({ tasks }: Props) {
  const { mutate: complete, isPending } = useCompleteDeputyTask();
  const columns = ['pending', 'assigned', 'in_progress', 'completed'] as const;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutList className="w-5 h-5 text-teal-400" />
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">Task Board</h3>
            <p className="text-xs text-gray-400 mt-0.5">Kanban execution tracker</p>
          </div>
        </div>
        <span className="text-xs text-warning-light bg-warning/10 px-2 py-1 rounded-full border border-warning/20 font-bold">
          {tasks.filter(t => t.status !== 'completed').length} active
        </span>
      </CardHeader>
      <CardBody className="p-4 flex-1 overflow-x-auto">
        <div className="grid grid-cols-4 gap-3 min-w-[700px]">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col);
            const st = statusStyle[col];
            return (
              <div key={col}>
                <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${st.color}`}>
                  {st.col} ({colTasks.length})
                </div>
                <div className="space-y-2">
                  {colTasks.map(t => (
                    <div key={t.id} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-lg hover:border-white/[0.08] transition-colors group">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${priorityStyle[t.priority]}`}>{t.priority}</span>
                      <h4 className="text-xs font-semibold text-white mt-1.5 leading-snug">{t.title}</h4>
                      <p className="text-[10px] text-gray-500 mt-1">→ {t.assignedTo}</p>
                      {(t.status === 'pending' || t.status === 'assigned') && (
                        <Button variant="ghost" size="sm" className="mt-1.5 text-[10px] h-6 w-full gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => complete(t.id)} disabled={isPending}>
                          <Check className="w-2.5 h-2.5" /> Done
                        </Button>
                      )}
                    </div>
                  ))}
                  {colTasks.length === 0 && <p className="text-[10px] text-gray-600 text-center py-4">Empty</p>}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
