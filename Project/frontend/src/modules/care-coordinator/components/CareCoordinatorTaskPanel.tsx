'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { CareTask } from '../types/careCoordinator.types';
import { ClipboardList, Network } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { tasks: CareTask[]; }

export function CareCoordinatorTaskPanel({ tasks }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-emerald-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-emerald-400">CROSS-DEPARTMENT TASKS</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto bg-black/20">
        <div className="divide-y divide-white/[0.03]">
          {tasks.map(task => (
            <div key={task.id} className={cn("p-4 transition-colors border-l-2", 
              task.isBottleneck ? "bg-emergency/10 border-emergency" : "hover:bg-white/[0.015] border-transparent"
            )}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className={cn("text-[13px] font-bold", task.isBottleneck ? "text-emergency-light" : "text-white")}>
                    {task.title}
                  </h4>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] font-mono text-gray-400 bg-black/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Network className="w-3 h-3"/> {task.assignedTeam}
                    </span>
                  </div>
                </div>
                <span className={cn("text-[9px] uppercase font-bold px-2 py-0.5 rounded", 
                  task.priority === 'Urgent' || task.priority === 'STAT' ? "bg-emergency/20 text-emergency-light" : "bg-white/10 text-gray-300"
                )}>{task.priority}</span>
              </div>
              
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/[0.03]">
                 <span className="text-[10px] text-gray-500 font-mono">Due: {new Date(task.dueDate).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</span>
                 {task.status === 'Pending' && (
                   <Button size="sm" className="bg-surface-dark border border-white/10 hover:bg-white/5 text-[10px] h-7">Nudge Team</Button>
                 )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
