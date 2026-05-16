'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { HVACTask, HvacTaskPriority } from '../types/hvac.types';
import { Wind, AlertTriangle, MapPin } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { tasks: HVACTask[]; selectedId?: string; onSelect: (id: string) => void; }

const priorityColor: Record<HvacTaskPriority, string> = {
  Preventive: 'bg-emerald-500/20 text-emerald-400',
  Routine: 'bg-gray-500/20 text-gray-300',
  Critical: 'bg-emergency/20 text-emergency-light border border-emergency/30',
};

export function HvacTaskQueue({ tasks, selectedId, onSelect }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center gap-2">
        <div className="p-1.5 rounded bg-teal-500/15"><Wind className="w-4 h-4 text-teal-400" /></div>
        <h3 className="text-[14px] font-bold text-white tracking-wide">HVAC Tasks</h3>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {tasks.map(t => (
            <div key={t.id} onClick={() => onSelect(t.id)}
              className={cn("p-4 cursor-pointer transition-all border-l-4 relative",
                selectedId === t.id ? "bg-teal-500/[0.08] border-l-teal-500" :
                t.isEmergency ? "bg-emergency/[0.03] border-l-emergency hover:bg-emergency/[0.05]" :
                "border-l-transparent hover:bg-white/[0.02]"
              )}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-[14px] font-bold text-white pr-2">{t.title}</h4>
                <span className={cn('text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider whitespace-nowrap', priorityColor[t.priority])}>{t.priority}</span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono flex items-center gap-1.5 mb-2"><MapPin className="w-3 h-3" /> {t.location}</p>
              <div className="flex justify-between items-center mt-3">
                <span className={cn("text-[10px] font-bold px-2 py-1 rounded", 
                  t.status === 'In Progress' ? 'bg-teal-500/20 text-teal-400' : 'bg-white/10 text-gray-300'
                )}>{t.status}</span>
                {t.isEmergency && <span className="flex items-center gap-1 text-[10px] text-emergency-light font-bold bg-emergency/10 px-2 py-1 rounded animate-pulse"><AlertTriangle className="w-3 h-3" /> EMERGENCY</span>}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
