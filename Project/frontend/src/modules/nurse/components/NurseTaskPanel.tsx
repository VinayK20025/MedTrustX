'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { NurseTask } from '../types/nurse.types';
import { ClipboardList, AlertTriangle, ShieldCheck, PlayCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { tasks: NurseTask[]; }

export function NurseTaskPanel({ tasks }: Props) {
  // Sort tasks by priority and time
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (b.priority === 'high' && a.priority !== 'high') return 1;
    return 0;
  });

  return (
    <Card className="border-indigo-500/20 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-indigo-500/20 px-5 py-4 flex items-center justify-between bg-indigo-500/5">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">My Task List</h3>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[500px]">
        {sortedTasks.map(t => (
          <div key={t.id} className={`p-4 rounded-xl border ${t.priority === 'high' ? 'border-emergency/30 bg-emergency/5' : 'border-white/[0.06] bg-surface-dark'} relative overflow-hidden transition-all hover:border-indigo-500/30 group`}>
             {t.priority === 'high' && <div className="absolute left-0 top-0 w-1 h-full bg-emergency" />}
             
             <div className="flex justify-between items-start mb-3">
               <div>
                 <div className="flex items-center gap-2 mb-1">
                   <span className="text-sm font-bold text-white leading-tight">{t.title}</span>
                   {t.requiresValidation && <ShieldCheck className="w-4 h-4 text-warning-light" />}
                 </div>
                 <span className="text-[11px] text-gray-400 font-mono block">
                   {t.patientName} ({t.bed})
                 </span>
               </div>
               <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded ${t.priority === 'high' ? 'bg-emergency/20 text-emergency-light' : 'bg-surface-light text-gray-400'}`}>
                 {t.time}
               </span>
             </div>

             <div className="flex justify-between items-end mt-4 pt-3 border-t border-white/[0.04]">
                <span className="text-[10px] uppercase tracking-widest text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded">{t.type}</span>
                <div className="flex gap-2">
                  {t.status === 'pending' && (
                    <Button size="sm" className="h-8 px-4 text-xs bg-indigo-600 hover:bg-indigo-700 text-white border-none flex items-center gap-2">
                      <PlayCircle className="w-4 h-4" /> Start Task
                    </Button>
                  )}
                  {t.status === 'in_progress' && (
                    <Button size="sm" className="h-8 px-4 text-xs bg-success hover:bg-success-light text-black font-bold border-none flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Complete
                    </Button>
                  )}
                </div>
             </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
