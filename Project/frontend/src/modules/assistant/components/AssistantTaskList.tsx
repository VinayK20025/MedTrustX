'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { AssistantTask } from '../types/assistant.types';
import { ClipboardList, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { tasks: AssistantTask[]; }

export function AssistantTaskList({ tasks }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-400" />
          <h3 className="text-[15px] font-semibold text-white tracking-wide">My Tasks</h3>
        </div>
      </CardHeader>
      <CardBody className="p-3 flex-1 overflow-y-auto space-y-3">
        {tasks.map(t => (
          <div key={t.id} className="p-4 rounded-xl border border-white/[0.06] bg-surface-dark hover:border-indigo-500/30 transition-all flex flex-col gap-3 group">
            <div className="flex justify-between items-start">
              <div>
                 <span className="text-sm font-bold text-white block">{t.title}</span>
                 <span className="text-[12px] text-gray-400 mt-1 block">{t.patientName} • {t.bed}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-warning-light bg-warning/10 px-2 py-1 rounded font-mono border border-warning/20">
                <Clock className="w-3 h-3" /> {t.timeScheduled}
              </div>
            </div>
            <div className="flex justify-end mt-2">
               <Button className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold flex items-center justify-center gap-2 h-10">
                 Start Task <ArrowRight className="w-4 h-4" />
               </Button>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
