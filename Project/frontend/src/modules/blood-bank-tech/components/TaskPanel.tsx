'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { ClipboardList, Droplet, TestTube, GitMerge, Box, Truck, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { LabTask } from '../types/blood-bank-tech.types';

interface TaskPanelProps {
  tasks: LabTask[];
  onSelectTask?: (id: string) => void;
  activeTaskId?: string;
}

const typeConfig = {
  Collection: { icon: Droplet, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  Screening: { icon: TestTube, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  Crossmatch: { icon: GitMerge, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  Storage: { icon: Box, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  Dispatch: { icon: Truck, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
};

export const TaskPanel: React.FC<TaskPanelProps> = ({ tasks, onSelectTask, activeTaskId }) => {
  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader className="border-b border-white/[0.06] pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
            <ClipboardList className="w-4 h-4 text-teal-400" />
            My Lab Tasks
          </CardTitle>
          <span className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-gray-400 border border-white/10">
            {tasks.length} Active
          </span>
        </div>
      </CardHeader>
      <CardBody className="flex-1 overflow-y-auto p-0">
        <div className="divide-y divide-white/[0.04]">
          {tasks.map((task) => {
            const config = typeConfig[task.type];
            const Icon = config.icon;
            const isUrgent = task.priority === 'Urgent' || task.priority === 'STAT';

            return (
              <div 
                key={task.id} 
                onClick={() => onSelectTask?.(task.id)}
                className={cn(
                  "p-4 cursor-pointer transition-colors hover:bg-white/[0.02]",
                  activeTaskId === task.id ? "bg-white/[0.04] border-l-2 border-teal-500" : "border-l-2 border-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-md border", config.bg, config.color, config.border)}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium text-white">{task.type}</span>
                  </div>
                  {isUrgent && (
                    <div className="flex items-center gap-1 text-[10px] text-rose-400 font-medium bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 uppercase tracking-wider">
                      <AlertTriangle className="w-3 h-3" />
                      {task.priority}
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-400 space-y-1 pl-8">
                  {task.unitId && <div>Unit ID: <span className="text-gray-300">{task.unitId}</span></div>}
                  {task.patientId && <div>Patient ID: <span className="text-gray-300">{task.patientId}</span></div>}
                  <div className="flex items-center gap-1 pt-1 text-[10px] text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Assigned: {new Date(task.assignedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
