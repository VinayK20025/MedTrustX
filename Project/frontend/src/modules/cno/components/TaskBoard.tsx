'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { NursingTask } from '../types/cno.types';
import { Clock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TaskBoardProps {
  tasks: NursingTask[];
}

export function TaskBoard({ tasks }: TaskBoardProps) {
  const columns = [
    { id: 'pending', title: 'Pending', color: 'bg-white/10' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-indigo-500/20 text-indigo-300' },
    { id: 'completed', title: 'Completed', color: 'bg-success/20 text-success-light' },
    { id: 'missed', title: 'Missed', color: 'bg-emergency/20 text-emergency-light' },
  ];

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Nursing Task Board</h3>
          <p className="text-xs text-gray-400 mt-0.5">Live orchestration of bedside care</p>
        </div>
      </CardHeader>
      
      <CardBody className="p-4 flex-1 overflow-x-auto">
        <div className="flex gap-4 h-[400px] min-w-[800px]">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="flex-1 flex flex-col bg-surface-dark border border-white/[0.04] rounded-xl overflow-hidden">
                <div className={`p-3 text-xs font-bold uppercase tracking-wider ${col.color} flex justify-between items-center`}>
                  {col.title}
                  <span className="bg-black/20 px-2 py-0.5 rounded-full">{colTasks.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {colTasks.map(task => (
                    <div key={task.id} className="bg-surface-light border border-white/[0.06] rounded-lg p-3 hover:border-white/[0.1] transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${task.priority === 'high' ? 'bg-emergency/20 text-emergency-light' : 'bg-white/10 text-gray-300'}`}>
                          {task.taskType}
                        </span>
                        <div className="flex items-center text-[10px] text-gray-500 font-mono">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(task.dueTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-white mb-1">{task.patientName}</p>
                      <p className="text-xs text-gray-400 mb-3">{task.room} • {task.description}</p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <User className="w-3 h-3" />
                          {task.assignedTo ? task.assignedTo : <span className="text-warning-light">Unassigned</span>}
                        </div>
                        {col.id === 'pending' && (
                          <Button variant="ghost" size="sm" className="text-xs h-6 px-2 opacity-0 group-hover:opacity-100 text-indigo-400">
                            Assign <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="h-full flex items-center justify-center text-gray-600 text-sm font-medium">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
