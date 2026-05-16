'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { GuidedTask } from '../types/jr.types';
import { Button } from '@/components/ui/Button';
import { ListTodo, CheckCircle2, Circle, AlertCircle, BookOpen } from 'lucide-react';
import { useUpdateJRTaskStep } from '../hooks/useJRAnalytics';

interface Props { tasks: GuidedTask[]; }

export function GuidedTaskPanel({ tasks }: Props) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(tasks[0]?.id || null);
  const { mutate: updateStep, isPending } = useUpdateJRTaskStep();

  const activeTask = tasks.find(t => t.id === activeTaskId);

  return (
    <Card className="border-indigo-500/30 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-indigo-500/20 px-5 py-4 flex justify-between items-center bg-indigo-500/5">
        <div className="flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">Guided Execution</h3>
        </div>
        {activeTask?.protocolLink && (
           <Button size="sm" variant="outline" className="h-7 text-[10px] border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 flex items-center gap-1">
             <BookOpen className="w-3 h-3" /> View Protocol
           </Button>
        )}
      </CardHeader>
      <CardBody className="p-0 flex-1 flex h-[500px]">
        {/* Task Selection Sidebar */}
        <div className="w-1/3 border-r border-white/[0.04] bg-surface-dark/50 overflow-y-auto">
          {tasks.map(t => (
            <div 
              key={t.id} 
              onClick={() => setActiveTaskId(t.id)}
              className={`p-4 border-b border-white/[0.04] cursor-pointer transition-colors ${activeTaskId === t.id ? 'bg-indigo-500/10 border-l-4 border-l-indigo-500' : 'hover:bg-white/[0.02] border-l-4 border-l-transparent'}`}
            >
              <h4 className={`text-xs font-bold ${activeTaskId === t.id ? 'text-indigo-300' : 'text-gray-300'}`}>{t.title}</h4>
              <p className="text-[10px] text-gray-500 mt-1">{t.patientName}</p>
              <div className="mt-2 flex items-center gap-1">
                <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400">By: {t.supervisor}</span>
                {t.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-success-light ml-auto" />}
              </div>
            </div>
          ))}
        </div>
        
        {/* Step-by-Step Execution Area */}
        <div className="w-2/3 p-6 overflow-y-auto bg-surface-dark">
          {activeTask ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{activeTask.title}</h2>
                <p className="text-sm text-gray-400">Patient: {activeTask.patientName}</p>
              </div>

              <div className="space-y-4">
                {activeTask.steps.map((step, idx) => {
                  const isReady = idx === 0 || activeTask.steps[idx - 1].isCompleted;
                  return (
                    <div key={step.id} className={`p-4 rounded-lg border ${step.isCompleted ? 'bg-success/5 border-success/20' : isReady ? 'bg-indigo-500/5 border-indigo-500/30' : 'bg-white/[0.01] border-white/[0.02] opacity-50'}`}>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {step.isCompleted ? <CheckCircle2 className="w-5 h-5 text-success-light" /> : <Circle className={`w-5 h-5 ${isReady ? 'text-indigo-400' : 'text-gray-600'}`} />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${step.isCompleted ? 'text-gray-400 line-through' : isReady ? 'text-white font-medium' : 'text-gray-500'}`}>
                            {idx + 1}. {step.instruction}
                          </p>
                          {isReady && !step.isCompleted && (
                            <div className="mt-3 flex gap-2">
                              <Button 
                                size="sm" 
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] h-7"
                                onClick={() => updateStep({ taskId: activeTask.id, stepId: step.id })}
                                disabled={isPending}
                              >
                                Mark Step Complete
                              </Button>
                              {step.requiresConfirmation && (
                                <span className="text-[10px] text-warning-light bg-warning/10 px-2 py-1 rounded flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Requires extreme care
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm">Select a task to begin guided execution</div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
