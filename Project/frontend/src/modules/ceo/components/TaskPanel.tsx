'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { CeoTask } from '../types/ceo.types';
import { useApproveTask } from '../hooks/useCeoAnalytics';

interface TaskPanelProps {
  tasks: CeoTask[];
}

export function TaskPanel({ tasks }: TaskPanelProps) {
  const { mutate: handleAction, isPending } = useApproveTask();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light flex flex-col h-full">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Pending Actions</h3>
          <p className="text-xs text-gray-400 mt-0.5">Tasks requiring executive approval</p>
        </div>
        <div className="px-2.5 py-1 rounded bg-teal-500/10 text-teal-400 text-xs font-semibold">
          {tasks.length} Pending
        </div>
      </CardHeader>
      
      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
            <CheckCircle2 className="w-8 h-8 mb-2 opacity-20" />
            <p>No pending approvals</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {tasks.map((task) => (
              <div key={task.id} className="p-5 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                      task.priority === 'high' ? 'bg-emergency/20 text-emergency-light' : 'bg-warning/20 text-warning-light'
                    }`}>
                      {task.priority} Priority
                    </span>
                    <span className="text-xs text-gray-500 font-medium bg-white/[0.04] px-2 py-0.5 rounded">
                      {task.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {new Date(task.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                
                <h4 className="text-sm font-semibold text-white mb-1">{task.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed mb-3">{task.description}</p>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="text-xs text-gray-500">
                    Requested by: <span className="text-gray-300 font-medium">{task.requester}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.actions.includes('Reject') && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleAction({ taskId: task.id, action: 'reject' })}
                        disabled={isPending}
                        className="text-emergency-light hover:bg-emergency/10 hover:text-emergency-light h-8 text-xs"
                      >
                        Reject
                      </Button>
                    )}
                    {task.actions.includes('Approve') && (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => handleAction({ taskId: task.id, action: 'approve' })}
                        disabled={isPending}
                        className="h-8 text-xs px-4"
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
