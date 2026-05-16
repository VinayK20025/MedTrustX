'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { WardTask } from '../types/ward.types';
import { ClipboardList, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { tasks: WardTask[]; }

export function WardTaskBoard({ tasks }: Props) {
  const columns = [
    { id: 'todo', title: 'To Do', color: 'border-white/[0.1]', bg: 'bg-white/[0.02]', items: tasks.filter(t => t.status === 'todo') },
    { id: 'in_progress', title: 'In Progress', color: 'border-teal-500/30', bg: 'bg-teal-500/5', items: tasks.filter(t => t.status === 'in_progress') },
    { id: 'completed', title: 'Completed', color: 'border-success/30', bg: 'bg-success/5', items: tasks.filter(t => t.status === 'completed') }
  ];

  return (
    <Card className="border-teal-500/20 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-teal-500/20 px-5 py-4 flex items-center justify-between bg-teal-500/5">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">Nursing Task Board</h3>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-[800px]">
          {columns.map(col => (
            <div key={col.id} className={`flex-1 rounded-xl border ${col.color} ${col.bg} p-3 flex flex-col`}>
               <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-3 px-1">{col.title} ({col.items.length})</h4>
               <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                 {col.items.map(t => (
                   <div key={t.id} className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-white block leading-tight">{t.title}</span>
                        {t.priority === 'high' && <AlertTriangle className="w-3 h-3 text-emergency-light" />}
                      </div>
                      <div className="text-[10px] text-gray-400 mb-2 font-mono">
                        {t.patientName} ({t.bed})
                      </div>
                      <div className="flex justify-between items-end mt-2 pt-2 border-t border-white/[0.04]">
                         <span className="text-[9px] uppercase tracking-widest text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded">{t.type}</span>
                         <div className="text-right">
                           <span className="text-[9px] text-gray-500 block mb-0.5"><Clock className="inline w-3 h-3 mr-1"/>{t.dueDate}</span>
                           <span className="text-[10px] text-white font-bold">{t.assignedNurse || 'Unassigned'}</span>
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
