'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SuperTask } from '../types/superintendent.types';
import { CheckSquare, Check } from 'lucide-react';
import { useCompleteTask } from '../hooks/useSuperintendentAnalytics';

interface Props { tasks: SuperTask[]; }

const priorityStyle: Record<string, string> = {
  critical: 'bg-emergency text-white',
  high:     'bg-emergency/20 text-emergency-light border border-emergency/30',
  medium:   'bg-warning/20 text-warning-light border border-warning/30',
  low:      'bg-white/10 text-gray-300 border border-white/20',
};

const statusColor: Record<string, string> = {
  pending:     'text-warning-light',
  in_progress: 'text-indigo-300',
  completed:   'text-success-light',
};

export function TaskPanel({ tasks }: Props) {
  const { mutate: complete, isPending } = useCompleteTask();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-warning-light" />
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">Tasks & Escalations</h3>
            <p className="text-xs text-gray-400 mt-0.5">Operational task queue</p>
          </div>
        </div>
        <span className="text-xs text-warning-light bg-warning/10 px-2 py-1 rounded-full border border-warning/20 font-bold">
          {tasks.filter(t => t.status !== 'completed').length} pending
        </span>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[350px]">
        <div className="divide-y divide-white/[0.04]">
          {tasks.map(t => (
            <div key={t.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${priorityStyle[t.priority]}`}>{t.priority}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ml-auto ${statusColor[t.status]}`}>● {t.status.replace('_', ' ')}</span>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1.5">{t.title}</h4>
              <div className="flex flex-wrap gap-x-4 text-[10px] text-gray-500">
                <span>Assigned: <span className="text-gray-300">{t.assignedTo}</span></span>
                <span>Dept: <span className="text-gray-300">{t.department}</span></span>
              </div>
              {t.status === 'pending' && (
                <Button variant="outline" size="sm" className="mt-2 text-xs h-7 gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => complete(t.id)} disabled={isPending}>
                  <Check className="w-3 h-3" /> Mark Done
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
