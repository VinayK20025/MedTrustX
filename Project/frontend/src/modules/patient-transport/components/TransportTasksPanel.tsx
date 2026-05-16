'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { TransportTask } from '../types/patient-transport.types';
import { Navigation, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { tasks: TransportTask[]; selectedId?: string; onSelect: (id: string) => void; }

const priorityColor = { Urgent: 'border-emergency bg-emergency/[0.04]', Routine: 'border-blue-500 bg-blue-500/[0.04]' };

export function TransportTasksPanel({ tasks, selectedId, onSelect }: Props) {
  const activeTasks = tasks.filter(t => t.status !== 'Completed');

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <Navigation className="w-4 h-4 text-emerald-400" /> Dispatch Queue
        </h3>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">{activeTasks.length} Active</span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {activeTasks.map(t => (
            <div key={t.id} onClick={() => onSelect(t.id)}
              className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                priorityColor[t.priority],
                selectedId === t.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
              )}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-gray-400">{t.id}</span>
                <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex items-center gap-1 tracking-wider',
                  t.priority === 'Urgent' ? 'bg-emergency/15 text-emergency-light' : 'bg-blue-500/15 text-blue-300'
                )}>
                  {t.priority === 'Urgent' && <AlertTriangle className="w-2.5 h-2.5" />}
                  {t.priority}
                </span>
              </div>
              
              <h4 className="text-[13px] font-bold text-white mb-2">{t.patientName}</h4>
              
              <div className="flex items-center justify-between bg-black/30 p-2 rounded border border-white/5 mb-2">
                <div className="flex-1 text-center">
                  <span className="block text-[9px] uppercase text-gray-500 font-bold mb-0.5">From</span>
                  <span className="text-[10px] text-gray-300 truncate">{t.fromLocation}</span>
                </div>
                <ArrowRight className="w-3 h-3 text-emerald-400 mx-2" />
                <div className="flex-1 text-center">
                  <span className="block text-[9px] uppercase text-gray-500 font-bold mb-0.5">To</span>
                  <span className="text-[10px] text-emerald-300 font-bold truncate">{t.toLocation}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] mt-2">
                 <span className="text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">{t.equipment}</span>
                 <span className={cn('font-bold uppercase tracking-wider', t.status === 'In Transit' ? 'text-emerald-400' : 'text-gray-400')}>{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
