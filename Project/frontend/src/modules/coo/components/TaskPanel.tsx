'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Clock } from 'lucide-react';
import type { CooTask } from '../types/coo.types';
import { useUpdateTask } from '../hooks/useCooAnalytics';

interface TaskPanelProps {
  tasks: CooTask[];
}

export function TaskPanel({ tasks }: TaskPanelProps) {
  const { mutate: updateStatus, isPending } = useUpdateTask();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Execution Center</h3>
          <p className="text-xs text-gray-400 mt-0.5">Manage operational task execution</p>
        </div>
      </CardHeader>
      
      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.04]">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                  task.priority === 'high' ? 'bg-emergency/20 text-emergency-light' : 'bg-info/20 text-info-light'
                }`}>
                  {task.priority} Priority
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                  <Clock className="w-3 h-3" />
                  {new Date(task.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              <h4 className="text-sm font-semibold text-white mb-1">{task.title}</h4>
              <p className="text-sm text-gray-400 leading-relaxed mb-3">{task.description}</p>
              
              <div className="flex items-center justify-end gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => updateStatus({ taskId: task.id, status: 'in_progress' })}
                  disabled={isPending || task.status === 'in_progress'}
                  className="h-7 text-xs"
                >
                  Start
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => updateStatus({ taskId: task.id, status: 'completed' })}
                  disabled={isPending}
                  className="h-7 text-xs"
                >
                  Mark Complete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
