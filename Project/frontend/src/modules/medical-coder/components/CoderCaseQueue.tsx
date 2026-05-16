'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { CoderCase } from '../types/coder.types';
import { ListTodo, AlertTriangle, FileBox } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { queue: CoderCase[]; }

export function CoderCaseQueue({ queue }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-blue-500/15"><ListTodo className="w-3.5 h-3.5 text-blue-400" /></div>
          <h3 className="text-[13px] font-bold text-white tracking-wide">Case Queue</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {queue.map(c => (
            <div key={c.id} className={cn("p-3 transition-colors cursor-pointer border-l-2", 
               c.status === 'In Progress' ? "bg-blue-500/5 border-blue-500" : 
               c.status === 'Validation Error' ? "bg-emergency/5 border-emergency" : "border-transparent hover:bg-white/[0.015]"
            )}>
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-[12px] font-bold text-white flex items-center gap-1.5">
                  {c.patientName}
                  {c.status === 'Validation Error' && <AlertTriangle className="w-3 h-3 text-emergency-light" />}
                </h4>
                <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded font-mono', 
                  c.priority === 'Urgent' || c.priority === 'High' ? 'bg-emergency/20 text-emergency-light' : 'bg-gray-500/20 text-gray-300'
                )}>
                  {c.priority}
                </span>
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono mt-2">
                 <span className="flex items-center gap-1"><FileBox className="w-3 h-3"/> {c.encounterType} • {c.id}</span>
                 <span className={cn(c.status === 'Validation Error' ? "text-emergency-light" : "")}>{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
