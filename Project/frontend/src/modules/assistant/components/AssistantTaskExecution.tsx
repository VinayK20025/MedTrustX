'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { AssistantTask } from '../types/assistant.types';
import { CheckSquare, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { 
  task?: AssistantTask;
}

export function AssistantTaskExecution({ task }: Props) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  if (!task) {
    return (
      <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col items-center justify-center p-6 text-center">
        <Info className="w-10 h-10 text-gray-500 mb-3" />
        <h3 className="text-white font-bold">No Task Selected</h3>
        <p className="text-gray-400 text-sm mt-1">Select a task from the list to view instructions.</p>
      </Card>
    );
  }

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const isComplete = completedSteps.length === task.instructions.length;

  return (
    <Card className="border-indigo-500/20 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-indigo-500/10 px-5 py-4 flex items-center justify-between bg-indigo-500/5">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-indigo-400" />
          <h3 className="text-[15px] font-semibold text-white tracking-wide">Task Execution</h3>
        </div>
      </CardHeader>
      <CardBody className="p-6 flex-1 flex flex-col">
         
         <div className="mb-6 p-4 rounded-xl bg-surface-dark border border-white/10">
            <h2 className="text-xl font-bold text-white">{task.title}</h2>
            <p className="text-sm text-gray-400 mt-1">{task.patientName} • {task.bed}</p>
         </div>

         <div className="flex-1 overflow-y-auto">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Step-by-Step Instructions</h4>
            <div className="space-y-3">
              {task.instructions.map((instruction, idx) => {
                const checked = completedSteps.includes(idx);
                return (
                  <button 
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                      checked ? 'border-success/30 bg-success/10' : 'border-white/[0.06] bg-surface-dark hover:border-white/20'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      checked ? 'bg-success text-white border-success' : 'border-gray-500 text-transparent'
                    }`}>
                      {checked && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span className={`text-sm ${checked ? 'text-gray-300 line-through' : 'text-white'}`}>
                      {instruction}
                    </span>
                  </button>
                );
              })}
            </div>
         </div>

         <div className="mt-6 pt-4 border-t border-white/10">
           <Button 
             className={`w-full h-12 text-lg font-bold ${isComplete ? 'bg-success hover:bg-success-light text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
             disabled={!isComplete}
           >
             {isComplete ? 'Mark Task Complete' : 'Complete All Steps'}
           </Button>
         </div>
      </CardBody>
    </Card>
  );
}
