'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ICUTask } from '../types/icu.types';
import { ClipboardList, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { tasks: ICUTask[]; }

export function ICUTaskPanel({ tasks }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-gray-300" />
          <h3 className="text-lg font-semibold text-white tracking-wide">Pending Interventions</h3>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {tasks.map(t => (
          <div key={t.id} className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark flex flex-col gap-2">
            <div className="flex justify-between items-start">
               <div>
                 <span className="text-sm font-bold text-white block">{t.title}</span>
                 <span className="text-[10px] text-gray-400 font-mono">{t.bed}</span>
               </div>
               <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${t.priority === 'high' ? 'bg-emergency/20 text-emergency-light' : 'bg-warning/20 text-warning-light'}`}>
                 {t.priority}
               </span>
            </div>
            <div className="flex justify-between items-center mt-1 pt-2 border-t border-white/[0.04]">
               <span className="text-[10px] text-gray-400">{t.time}</span>
               <Button size="sm" className="h-6 px-3 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white border-none flex items-center gap-1">
                 <PlayCircle className="w-3 h-3" /> Execute
               </Button>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
