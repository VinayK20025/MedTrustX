'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { LinenTask, ProcessingBatch } from '../types/laundry.types';
import { useUpdateLinenTask, useAdvanceBatch } from '../hooks/useLaundryAnalytics';
import { WashingMachine, Waves, Wind, Layers, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { task?: LinenTask; batches: ProcessingBatch[]; }

export function LinenProcessingWorkspace({ task, batches }: Props) {
  const { mutate: updateTask } = useUpdateLinenTask();
  const { mutate: advanceBatch } = useAdvanceBatch();
  const [tab, setTab] = useState<'task' | 'plant'>('task');

  return (
    <Card className="border-purple-500/20 shadow-glass bg-[#030205] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-800 via-fuchsia-500 to-purple-400" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-[16px] font-black text-white flex items-center gap-2">
          <WashingMachine className="w-5 h-5 text-purple-400" /> Linen Operations
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Manage ward logistics and operate the central processing plant.</p>
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        <button onClick={() => setTab('task')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1', tab === 'task' ? 'text-purple-400 border-purple-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>Ward Logistics</button>
        <button onClick={() => setTab('plant')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors', tab === 'plant' ? 'text-purple-400 border-purple-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>Processing Plant</button>
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {tab === 'task' && (
          <div className="p-5 flex flex-col h-full">
            {!task ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                <ListTodo className="w-12 h-12 text-purple-500 mb-3" />
                <p className="text-gray-400 font-bold">Select a collection or distribution task.</p>
              </div>
            ) : (
              <div className="flex flex-col h-full space-y-4">
                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{task.id}</span>
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider',
                      task.category === 'Infectious' ? 'bg-emergency/20 text-emergency-light' : 'bg-blue-500/20 text-blue-300'
                    )}>{task.category} Linen</span>
                  </div>
                  
                  <h3 className="text-[20px] font-black text-white mb-1">{task.type} Request</h3>
                  <p className="text-[14px] text-gray-400 mb-6">Location: <strong className="text-white">{task.department}</strong></p>

                  <div className="bg-black/40 border border-white/5 rounded-lg p-4 flex items-center justify-between mb-6">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Expected Payload</span>
                    <span className="text-[24px] font-black font-mono text-purple-400">{task.quantity} <span className="text-[14px]">{task.unit}</span></span>
                  </div>

                  {task.category === 'Infectious' && (
                    <div className="bg-emergency/10 border border-emergency/30 rounded-lg p-3 flex items-start gap-2 mb-6">
                      <ShieldAlert className="w-4 h-4 text-emergency-light mt-0.5 shrink-0" />
                      <p className="text-[11px] text-red-200">Red bag isolation required. Do not mix with normal soiled linen. Transport directly to disinfection unit.</p>
                    </div>
                  )}

                  <div className="mt-auto">
                    {task.status === 'Pending' && (
                      <Button onClick={() => updateTask({ id: task.id, status: 'In Progress' })} className="w-full h-12 bg-purple-500/20 text-purple-400 border border-purple-500/40 hover:bg-purple-500/30">Start Execution</Button>
                    )}
                    {task.status === 'In Progress' && (
                      <Button onClick={() => updateTask({ id: task.id, status: 'Completed' })} className="w-full h-12 bg-success/20 text-success-light border border-success/40 hover:bg-success/30" leftIcon={<CheckCircle2 className="w-4 h-4" />}>Log as Completed</Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'plant' && (
          <div className="p-5 space-y-4">
            <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2">Active Processing Batches</h4>
            {batches.map(b => (
              <div key={b.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-mono text-gray-500">{b.id}</span>
                  <span className={cn('text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-wider',
                    b.batchType === 'Infectious' ? 'bg-emergency/20 text-emergency-light' : 'bg-blue-500/20 text-blue-300'
                  )}>{b.batchType}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-[14px] font-bold text-white">Payload: {b.weight}</span>
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                    {b.stage === 'Wash' && <Waves className="w-4 h-4 text-blue-400" />}
                    {b.stage === 'Dry' && <Wind className="w-4 h-4 text-orange-400" />}
                    {b.stage === 'Fold' && <Layers className="w-4 h-4 text-emerald-400" />}
                    <span className="text-[12px] font-bold text-gray-300 uppercase">{b.stage} Cycle</span>
                  </div>
                </div>

                <div className="h-1.5 bg-black rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-purple-500" style={{ width: `${b.progress}%` }} />
                </div>

                <Button onClick={() => advanceBatch(b.id)} className="w-full h-9 text-[11px] bg-white/5 border-transparent hover:bg-white/10" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>Advance to Next Stage</Button>
              </div>
            ))}
          </div>
        )}

      </CardBody>
    </Card>
  );
}

// Temporary icon
import { ListTodo } from 'lucide-react';
